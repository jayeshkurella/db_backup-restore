from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q

from Mainapp.Serializers.serializers import PersonSerializer
from Mainapp.models import Person
from Mainapp.models.person_match_history import PersonMatchHistory


class MissingPersonMatchWithUPsViewSet(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        try:
            missing_person = Person.objects.get(
                id=pk,
                type='Missing Person',
                person_approve_status='approved'
            )
        except Person.DoesNotExist:
            return Response({"error": "Missing person not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get previously matched/rejected/confirmed UPs for this MP
        history_qs = PersonMatchHistory.objects.filter(missing_person=missing_person)
        previously_matched_ids = history_qs.values_list('unidentified_person_id', flat=True)

        # Get eligible UPs (excluding ones seen before for this MP)
        eligible_ups = Person.objects.filter(
            type='Unidentified Person',
            person_approve_status='approved',
            case_status__in=['pending', 'matched']
        ).exclude(id__in=previously_matched_ids)

        # Calculate scores and find matches
        newly_matched = []
        for up in eligible_ups:
            score = self.calculate_match_score(missing_person, up)

            # Create match history record
            match_record = PersonMatchHistory.objects.create(
                missing_person=missing_person,
                unidentified_person=up,
                match_type='matched' if score >= 70 else 'potential',
                score=score,
                match_parameters=self._get_match_parameters(missing_person, up)
            )

            if score >= 70:
                newly_matched.append({
                    'person': PersonSerializer(up).data,
                    'score': score
                })

        # Categorize previously matched ones with scores
        previously_matched = []
        rejected = []
        confirmed = []

        for match in history_qs:
            up_data = PersonSerializer(match.unidentified_person).data
            match_data = {
                'person': up_data,
                'score': match.score,
                'match_type': match.match_type,
                'created_at': match.created_at
            }

            if match.match_type == 'matched':
                previously_matched.append(match_data)
            elif match.match_type == 'rejected':
                rejected.append(match_data)
            elif match.match_type == 'confirmed':
                confirmed.append(match_data)

        return Response({
            "newly_matched": newly_matched,
            "previously_matched": previously_matched,
            "rejected": rejected,
            "confirmed": confirmed,
            "missing_person": PersonSerializer(missing_person).data
        })

    def calculate_match_score(self, mp, up):
        """
        Calculates a match score between a Missing Person (mp) and an Unidentified Person (up),
        based on various physical attributes.
        """
        score = 0

        # Gender match (25 points)
        if mp.gender and up.gender and mp.gender.lower() == up.gender.lower():
            score += 25

        # Age match (30 points max)
        if mp.age is not None and up.age_range is not None:
            # Assuming age_range is in format like "20-30" or similar
            try:
                min_age, max_age = map(int, up.age_range.split('-'))
                if min_age <= mp.age <= max_age:
                    score += 30
                elif min_age - 2 <= mp.age <= max_age + 2:
                    score += 20
                elif min_age - 5 <= mp.age <= max_age + 5:
                    score += 10
            except (ValueError, AttributeError):
                pass
        elif mp.age is not None and up.age is not None:
            # Fallback if age_range not available but age is
            age_diff = abs(mp.age - up.age)
            if age_diff <= 2:
                score += 30
            elif age_diff <= 5:
                score += 20
            elif age_diff <= 10:
                score += 10

        # Height match (25 points max)
        if mp.height_range and up.height_range:
            # Both have height ranges - check if they overlap
            mp_min, mp_max = self._parse_height_range(mp.height_range)
            up_min, up_max = self._parse_height_range(up.height_range)

            if mp_min <= up_max and mp_max >= up_min:  # If ranges overlap
                score += 25
            elif (mp_min - 5 <= up_max and mp_max + 5 >= up_min):  # If within 5cm
                score += 15
            elif (mp_min - 10 <= up_max and mp_max + 10 >= up_min):  # If within 10cm
                score += 5
        elif mp.height is not None and up.height is not None:
            # Fallback if height ranges not available but heights are
            height_diff = abs(mp.height - up.height)
            if height_diff <= 5:
                score += 25
            elif height_diff <= 10:
                score += 15
            elif height_diff <= 20:
                score += 5

        # Weight match (20 points max)
        if mp.weight is not None and up.weight is not None:
            weight_diff = abs(mp.weight - up.weight)
            if weight_diff <= 500:  # 500 grams difference
                score += 20
            elif weight_diff <= 1000:  # 1 kg difference
                score += 10

        # Complexion match (10 points)
        if mp.complexion and up.complexion and mp.complexion.lower() == up.complexion.lower():
            score += 10

        # Hair color match (10 points)
        if mp.hair_color and up.hair_color and mp.hair_color.lower() == up.hair_color.lower():
            score += 10

        # Eye color match (10 points)
        if mp.eye_color and up.eye_color and mp.eye_color.lower() == up.eye_color.lower():
            score += 10

        return min(score, 100)  # Cap score at 100%

    def _parse_height_range(self, height_range):
        """
        Helper method to parse height range string into min and max values.
        Assumes format like "150-160" or similar.
        Returns (min_height, max_height) tuple.
        """
        try:
            min_h, max_h = map(int, height_range.split('-'))
            return min_h, max_h
        except (ValueError, AttributeError):
            return None, None

    def _get_match_parameters(self, mp, up):
        """
        Returns a dictionary of matching parameters for the history record
        """
        return {
            'gender_match': mp.gender == up.gender,
            'age_match': {
                'mp_age': mp.age,
                'up_age': up.age,
                'up_age_range': up.age_range
            },
            'height_match': {
                'mp_height': mp.height,
                'up_height': up.height,
                'mp_height_range': mp.height_range,
                'up_height_range': up.height_range
            },
            'weight_match': {
                'mp_weight': mp.weight,
                'up_weight': up.weight,
                'difference': abs(mp.weight - up.weight) if mp.weight and up.weight else None
            },
            'complexion_match': mp.complexion == up.complexion,
            'hair_color_match': mp.hair_color == up.hair_color,
            'eye_color_match': mp.eye_color == up.eye_color
        }