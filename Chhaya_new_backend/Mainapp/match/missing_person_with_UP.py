from django.db import transaction
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
    API to match a Missing Person (MP) with Unidentified Persons (UP).
    """

    def get(self, request, mp_id, *args, **kwargs):
        try:
            mp = Person.objects.get(id=mp_id, type=Person.TypeChoices.MISSING)
        except Person.DoesNotExist:
            return Response({"error": "Missing Person not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get already matched UPs for this MP
        already_matched_up_ids = set(Match.objects.filter(person=mp).values_list('match_person__id', flat=True))

        # Get UPs with 'pending' or 'matched' case_status, excluding already matched ones
        up_candidates = Person.objects.filter(
            type=Person.TypeChoices.Unidentified_Person,
            case_status__in=['pending', 'matched'],
            _is_deleted=False
        ).exclude(id__in=already_matched_up_ids)

        matches_to_create = []
        up_updates = []
        matched_up_ids = []

        for up in up_candidates:
            score = self.calculate_match_score(mp, up)

            if score > 9:
                matched_up_ids.append(up.id)

                # Prepare match records
                matches_to_create.append(
                    Match(
                        person=mp,
                        match_person=up,
                        status="matched",
                        score=score,
                        match_with=Match.MatchWithChoices.UNIDENTIFIED_PERSON
                    )
                )

                # Prepare updates for bulk saving
                up.match_with ="Missing Person"
                up.case_status = "matched"
                up_updates.append(up)

        # Perform database updates atomically
        with transaction.atomic():
            # Bulk create match records
            if matches_to_create:
                Match.objects.bulk_create(matches_to_create, ignore_conflicts=True)

            # Bulk update UPs
            if up_updates:
                Person.objects.bulk_update(up_updates, ["match_with", "case_status"])

            # Update MP status if matches exist
            if matched_up_ids:
                mp.match_with = "Unidentified Person"
                mp.case_status = "matched"
                mp.save(update_fields=["match_with", "case_status"])

        # If no matches were found, return a message
        if not matched_up_ids:
            return Response({"message": f"No matches found for {mp.full_name}"}, status=status.HTTP_200_OK)

        # Serialize matched UPs and apply pagination
        matched_up = Person.objects.filter(id__in=matched_up_ids).order_by('id')
        paginator = CustomPagination()
        paginated_data = paginator.paginate_queryset(matched_up, request)
        serialized_data = PersonSerializer(paginated_data, many=True).data

        return paginator.get_paginated_response(serialized_data)

    @staticmethod
    def calculate_match_score(mp: Person, up: Person) -> int:
        """
        Calculate the match score between a Missing Person and an Unidentified Person.
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
