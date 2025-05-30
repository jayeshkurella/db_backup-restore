from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class searchCase_Pagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        request = self.request
        base_url = request.build_absolute_uri().split('?')[0]
        current_page = self.page.number
        total_pages = self.page.paginator.num_pages

        def build_url(page):
            query_params = request.query_params.copy()
            query_params['page'] = page
            return f"{base_url}?{query_params.urlencode()}"

        return Response({
            'links': {
                'first': build_url(1),
                'previous': build_url(current_page - 1) if self.page.has_previous() else None,
                'next': build_url(current_page + 1) if self.page.has_next() else None,
                'last': build_url(total_pages),
            },
            'meta': {
                'current_page': current_page,
                'total_pages': total_pages,
                'page_size': self.get_page_size(request),
                'count': self.page.paginator.count,
            },
            'results': data
        })
