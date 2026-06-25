import { useEffect, useState } from '@wordpress/element';

function getCustomElementsRegistry() {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}
	return window.customElements;
}

export function isWebComponentAvailable( tagName ) {
	return !! getCustomElementsRegistry()?.get( tagName );
}

export function useWebComponentAvailability( tagName ) {
	const [ isAvailable, setIsAvailable ] = useState( () =>
		isWebComponentAvailable( tagName )
	);

	useEffect( () => {
		const customElementsRegistry = getCustomElementsRegistry();

		if ( isAvailable || ! customElementsRegistry ) {
			return undefined;
		}

		let isMounted = true;

		customElementsRegistry.whenDefined( tagName ).then( () => {
			if ( isMounted ) {
				setIsAvailable( true );
			}
		} );

		return () => {
			isMounted = false;
		};
	}, [ isAvailable, tagName ] );

	return isAvailable;
}

export function trueOrUndefined( value ) {
	return value ? true : undefined;
}
