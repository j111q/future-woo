/**
 * Analytics-style stat card mirroring CIAB's MetricWithComparison
 * (next-woocommerce-analytics/packages/widgets-toolkit/src/components/
 * metric-with-comparison + metric-value + metric-delta).
 *
 * Same anatomy: label on top, big value, then a coloured delta (up
 * green, down red — invertible). Built on @wordpress/ui primitives so
 * the look matches without pulling the unpublished CIAB workspace
 * packages.
 *
 *   <Card.Root>
 *     <Card.Content>
 *       <Stack direction="column" gap="xs">
 *         <Text body-sm muted>Active campaigns</Text>
 *         <Stack direction="row" align="baseline" gap="xs">
 *           <Text heading-2xl>5</Text>
 *           <Delta tone="up">+1 vs last month</Delta>
 *         </Stack>
 *       </Stack>
 *     </Card.Content>
 *   </Card.Root>
 */
import { Card, Stack, Text } from '@wordpress/ui';
import clsx from 'clsx';

type DeltaTone = 'up' | 'down' | 'neutral';

type Props = {
	label: React.ReactNode;
	value: React.ReactNode;
	delta?: React.ReactNode;
	deltaTone?: DeltaTone;
};

export const StatCard = ( {
	label,
	value,
	delta,
	deltaTone = 'neutral',
}: Props ): JSX.Element => (
	<Card.Root className="mcc-stat-card">
		<Card.Content>
			<Stack direction="column" gap="xs">
				<Text
					variant="body-sm"
					className="mcc-stat-card__label"
				>
					{ label }
				</Text>
				<Text
					variant="heading-2xl"
					className="mcc-stat-card__value"
				>
					{ value }
				</Text>
				{ delta && (
					<Text
						variant="body-sm"
						className={ clsx(
							'mcc-stat-card__delta',
							`mcc-stat-card__delta--${ deltaTone }`
						) }
					>
						{ delta }
					</Text>
				) }
			</Stack>
		</Card.Content>
	</Card.Root>
);
