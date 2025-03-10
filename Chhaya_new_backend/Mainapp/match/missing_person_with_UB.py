
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from Mainapp.Serializers.serializers import PersonSerializer
from Mainapp.models import Person, Match
from Mainapp.pagination import CustomPagination





class MatchMPWithUBAPIView(APIView):
    """
    API to match a Missing Person (MP) with all Unidentified Bodies (UB)
    """

    def get(self, request, mp_id, *args, **kwargs):
        try:
            mp = Person.objects.get(id=mp_id, type=Person.TypeChoices.MISSING)
        except Person.DoesNotExist:
            return Response({"error": "Missing Person not found"}, status=status.HTTP_404_NOT_FOUND)

        ub_candidates = Person.objects.filter(type=Person.TypeChoices.Unidnetified_Body, _is_deleted=False)

        matches = []
        for ub in ub_candidates:
            score = self.calculate_match_score(mp, ub)

            if score > 9:  # Threshold score for a valid match
                match_data = {
                    "mp_id": mp.id,
                    "ub_id": ub.id,
                    "score": score,
                    "status": "Pending"
                }
                matches.append(match_data)

                # Create or update the match record
                Match.objects.update_or_create(
                    person=mp,
                    match_person=ub,
                    defaults={"status": "pending", "score": score}
                )

                # Automatically update the case status to 'Resolved'
                mp.case_status = 'Resolved'
                mp.save()

        # Serialize matched UB data using PersonSerializer
        matched_ub_ids = [match["ub_id"] for match in matches]
        matched_ub = Person.objects.filter(id__in=matched_ub_ids)

        # Apply pagination
        paginator = CustomPagination()
        paginated_data = paginator.paginate_queryset(matched_ub, request)
        serialized_data = PersonSerializer(paginated_data, many=True).data

        return paginator.get_paginated_response(serialized_data)

    @staticmethod
    def calculate_match_score(mp: Person, ub: Person) -> int:
        """
        Calculate the matching score between a Missing Person (MP) and an Unidentified Body (UB).
        :param mp: Missing Person object
        :param ub: Unidentified Body object
        :return: Calculated score
        """
        score = 0
        if mp.gender == ub.gender:
            score += 3
        if mp.age and ub.age and abs(mp.age - ub.age) <= 5:
            score += 3
        if mp.height and ub.height and abs(mp.height - ub.height) <= 10:
            score += 2
        if mp.weight and ub.weight and abs(mp.weight - ub.weight) <= 10:
            score += 2

        return score
