/**
 * Generic hook for fetching paginated data from the WooCommerce REST API.
 * Uses parse:false to access X-WP-Total and X-WP-TotalPages headers.
 */
import { useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface UseWcRestResult< T > {
	data: T[];
	total: number;
	totalPages: number;
	isLoading: boolean;
	error: string | null;
}

export function useWcRest< T >(
	path: string,
	params: Record< string, string | number >
): UseWcRestResult< T > {
	const [ data, setData ] = useState< T[] >( [] );
	const [ total, setTotal ] = useState( 0 );
	const [ totalPages, setTotalPages ] = useState( 0 );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState< string | null >( null );

	// Serialize params for dependency comparison.
	const paramsKey = JSON.stringify( params );

	const fetchData = useCallback( async () => {
		setIsLoading( true );
		setError( null );

		try {
			const queryString = Object.entries( params )
				.filter( ( [ , v ] ) => v !== '' && v !== undefined )
				.map(
					( [ k, v ] ) =>
						`${ encodeURIComponent( k ) }=${ encodeURIComponent(
							v
						) }`
				)
				.join( '&' );

			const url = queryString ? `${ path }?${ queryString }` : path;

			const response = ( await apiFetch( {
				path: url,
				parse: false,
			} ) ) as Response;

			const json = ( await response.json() ) as T[];
			const wpTotal = parseInt(
				response.headers.get( 'X-WP-Total' ) || '0',
				10
			);
			const wpTotalPages = parseInt(
				response.headers.get( 'X-WP-TotalPages' ) || '0',
				10
			);

			setData( json );
			setTotal( wpTotal );
			setTotalPages( wpTotalPages );
		} catch ( err ) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch data'
			);
			setData( [] );
			setTotal( 0 );
			setTotalPages( 0 );
		} finally {
			setIsLoading( false );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ path, paramsKey ] );

	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	return { data, total, totalPages, isLoading, error };
}
