/**
 * Page header matching CIAB's @automattic/admin-toolkit Header pattern.
 *
 * Anatomy (matches Jill's CIAB reference screenshot):
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ Campaigns / Black Friday — Door Buster  [● Active]   [Edit]  │
 *   │ Nov 28 – Dec 1, 2026 · Goal: revenue · …                     │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * The parent crumb is rendered as a button (link semantics) so it
 * routes via the view-state machine, not a real anchor. Title and
 * parent share one typographic line and `/` separator. Badges sit
 * inline. Actions on the right.
 */
import { Stack, Text } from '@wordpress/ui';
import clsx from 'clsx';

type Crumb = {
	label: React.ReactNode;
	onClick?: () => void;
};

type Props = {
	/** Parent crumb. Rendered as a link before the title, separated by ` / `. */
	parent?: Crumb;
	title: React.ReactNode;
	subTitle?: React.ReactNode;
	badges?: React.ReactNode;
	actions?: React.ReactNode;
	tabs?: React.ReactNode;
	className?: string;
};

export const PageHeader = ( {
	parent,
	title,
	subTitle,
	badges,
	actions,
	tabs,
	className,
}: Props ): JSX.Element => (
	<Stack
		direction="column"
		className={ clsx( 'mcc-page-header', className, { 'has-tabs': tabs } ) }
		render={ <header /> }
	>
		<Stack
			direction="row"
			className="mcc-page-header__title-row"
			justify="space-between"
			align="center"
			gap="md"
		>
			<Stack direction="row" align="center" gap="sm" wrap="wrap">
				<Text
					variant="heading-lg"
					render={ <h1 /> }
					className="mcc-page-header__title"
				>
					{ parent && (
						<>
							<button
								type="button"
								className="mcc-page-header__crumb"
								onClick={ parent.onClick }
							>
								{ parent.label }
							</button>
							<span
								className="mcc-page-header__sep"
								aria-hidden="true"
							>
								{ ' / ' }
							</span>
						</>
					) }
					{ title }
				</Text>
				{ badges }
			</Stack>
			{ actions && (
				<Stack direction="row" align="center" gap="sm">
					{ actions }
				</Stack>
			) }
		</Stack>
		{ subTitle && <p className="mcc-page-header__subtitle">{ subTitle }</p> }
		{ tabs }
	</Stack>
);
