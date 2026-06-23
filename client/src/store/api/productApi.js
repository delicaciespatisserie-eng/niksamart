import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base';
export const productApi = createApi({ reducerPath: 'productApi', baseQuery: baseQueryWithReauth, tagTypes: ['Product'], endpoints: (b) => ({ getProducts: b.query({ query: (params='') => `/products${params}`, providesTags: ['Product'] }), getFeaturedProducts: b.query({ query: () => '/products/featured', providesTags: ['Product'] }), getProduct: b.query({ query: (slug) => `/products/${slug}`, providesTags: ['Product'] }), createProduct: b.mutation({ query: (body) => ({ url: '/products', method: 'POST', body }), invalidatesTags: ['Product'] }) }) });
export const { useGetProductsQuery, useGetFeaturedProductsQuery, useGetProductQuery, useCreateProductMutation } = productApi;
