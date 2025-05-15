from rest_framework.pagination import PageNumberPagination


class PendingPersonPagination(PageNumberPagination):
    page_size = 10  # Default page size (can be overridden by ?page_size=)
    page_size_query_param = 'page_size'
    max_page_size = 100