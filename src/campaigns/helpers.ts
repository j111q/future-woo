import type { Channel } from './types';

export const fmtMoney = ( n: number | null | undefined ): string =>
	n == null ? '—' : '$' + Number( n ).toLocaleString( 'en-US' );

export const fmtNum = ( n: number | null | undefined ): string =>
	n == null ? '—' : Number( n ).toLocaleString( 'en-US' );

export const fmtRoas = ( n: number | null | undefined ): string =>
	n == null ? '—' : Number( n ).toFixed( 1 ) + '×';

export const channelById = ( id: string ): Channel | null =>
	window.MCC_BOOT.channels.find( ( c ) => c.id === id ) || null;
