/**
 * Channel chips — a small circular badge with a coloured initial on a
 * light grey background. Tone is carried by the foreground colour, not
 * the fill, so dense stacks read as cohesive ("a bunch of channels")
 * rather than a clash of brand colours.
 *
 * `ChannelChipStack` shows up to 3 chips overlapping each other (with
 * a white ring) and rolls the rest into a `+N` overflow chip so the
 * column scales gracefully when a campaign runs on 5+ channels.
 */
import { Tooltip } from '@wordpress/components';
import { channelById } from './helpers';

type Props = {
	id: string;
	large?: boolean;
};

export const ChannelChip = ( { id, large = false }: Props ): JSX.Element | null => {
	const ch = channelById( id );
	if ( ! ch ) return null;

	const size = large ? 32 : 24;
	const style: React.CSSProperties = {
		width: size,
		height: size,
		fontSize: large ? 13 : 11,
		color: ch.color,
	};

	return (
		<Tooltip text={ ch.label }>
			<span
				className="mcc-chip"
				role="img"
				aria-label={ ch.label }
				style={ style }
			>
				{ ch.short }
			</span>
		</Tooltip>
	);
};

type StackProps = {
	ids: string[];
	max?: number;
};

export const ChannelChipStack = ( {
	ids,
	max = 3,
}: StackProps ): JSX.Element => {
	if ( ids.length === 0 ) {
		return <span className="mcc-dim">No channels yet</span>;
	}

	const visible = ids.slice( 0, max );
	const overflow = ids.length - visible.length;
	const overflowLabel =
		overflow > 0
			? ids
					.slice( max )
					.map( ( id ) => channelById( id )?.label || id )
					.join( ', ' )
			: '';

	return (
		<span className="mcc-chip-stack" role="list" aria-label="Channels">
			{ visible.map( ( id ) => (
				<span key={ id } className="mcc-chip-stack__item" role="listitem">
					<ChannelChip id={ id } />
				</span>
			) ) }
			{ overflow > 0 && (
				<Tooltip text={ overflowLabel }>
					<span
						className="mcc-chip mcc-chip--overflow"
						role="listitem"
						aria-label={ `${ overflow } more channels` }
					>
						{ `+${ overflow }` }
					</span>
				</Tooltip>
			) }
		</span>
	);
};

/** Backwards-compatible alias so existing imports keep working. */
export const ChannelChipList = ChannelChipStack;
