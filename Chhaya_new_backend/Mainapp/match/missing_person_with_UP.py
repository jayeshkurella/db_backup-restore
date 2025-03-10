from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from Mainapp.Serializers.serializers import PersonSerializer
from Mainapp.models import Person, Match
from Mainapp.pagination import CustomPagination



class MatchMPWithUPAPIView(APIView):
    """
    API to match a Missing Person (MP) with all Unidentified Persons (UP).
    Only UPs with 'pending' status or 'matched' with other MPs will be considered.
    """

    def get(self, request, mp_id, *args, **kwargs):
        try:
            mp = Person.objects.get(id=mp_id, type=Person.TypeChoices.MISSING)
        except Person.DoesNotExist:
            return Response({"error": "Missing Person not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get IDs of UPs already matched with this MP
        already_matched_up_ids = Match.objects.filter(person=mp).values_list('match_person__id', flat=True)

        # Fetch UPs with 'pending' status or 'matched' with other MPs, excluding already matched with the same MP
        up_candidates = Person.objects.filter(
            type=Person.TypeChoices.Unidentified_Person,
            _is_deleted=False
        ).filter(
            Q(case_status='pending') |
            Q(case_status='matched')
        ).exclude(id__in=already_matched_up_ids)

        matches = []
        for up in up_candidates:
            score = self.calculate_match_score(mp, up)

            if score > 9:
                match_data = {
                    "mp_id": mp.id,
                    "up_id": up.id,
                    "score": score,
                    "status": "matched"
                }
                matches.append(match_data)

                # Create or update the match record for the UP
                Match.objects.update_or_create(
                    person=mp,
                    match_person=up,
                    defaults={
                        "status": "matched",
                        "score": score,
                        "match_with": "Unidentified Person"
                    }
                )

                # Update status of MP and UP to 'matched'
                mp.match_with = "Unidentified Person"
                up.match_with = "Missing Person"
                mp.case_status = 'matched'
                up.case_status = 'matched'
                mp.save(update_fields=['match_with', 'case_status'])
                up.save(update_fields=['case_status', 'match_with'])

        if not matches:
            return Response({"message": f"No matches found for {mp.full_name}"}, status=status.HTTP_200_OK)

        # Serialize matched UP data using PersonSerializer
        matched_up_ids = [match["up_id"] for match in matches]
        matched_up = Person.objects.filter(id__in=matched_up_ids).order_by('id')

        # Apply pagination
        paginator = CustomPagination()
        paginated_data = paginator.paginate_queryset(matched_up, request)
        serialized_data = PersonSerializer(paginated_data, many=True).data

        return paginator.get_paginated_response(serialized_data)

    @staticmethod
    def calculate_match_score(mp: Person, up: Person) -> int:
        """
        Calculate the matching score between a Missing Person (MP) and an Unidentified Person (UP).
        :param mp: Missing Person object
        :param up: Unidentified Person object
        :return: Calculated score
        """
        score = 0
        if mp.gender == up.gender:
            score += 3
        if mp.age and up.age and abs(mp.age - up.age) <= 5:
            score += 3
        if mp.height and up.height and abs(mp.height - up.height) <= 10:
            score += 2
        if mp.weight and up.weight and abs(mp.weight - up.weight) <= 10:
            score += 2

        return score




