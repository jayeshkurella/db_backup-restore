from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class searchCase_Pagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'first': self.request.build_absolute_uri('?page=1'),
                'last': self.request.build_absolute_uri(f'?page={self.page.paginator.num_pages}'),
            },
            'count': self.page.paginator.count,
            'results': data
        })