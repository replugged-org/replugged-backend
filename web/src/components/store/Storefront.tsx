import type {Attributes} from 'preact';
import type {EligibilityStatus} from '../../../../types/store';
import {h, Fragment} from 'preact';
import {useContext, useEffect, useState} from 'preact/hooks';
import {useTitle} from 'hoofd/preact';
import {Router} from 'preact-router';
import {Link} from 'preact-router/match';
import {UserFlags} from '../../../../shared/flags';

import Redirect from '../util/Redirect';
import LayoutWithSidebar from '../layout/LayoutWithSidebar';
import Store from './Store';
import PublishForm from './form/Publish';
import VerificationForm from './form/Verification';
import HostingForm from './form/Hosting';

import UserContext from '../UserContext';
import {Endpoints, Routes} from '../../constants';

import Upload from 'feather-icons/dist/icons/upload.svg';
import Package from 'feather-icons/dist/icons/package.svg';
import Plugin from '../../assets/icons/plugin.svg';
import Theme from '../../assets/icons/brush.svg';
import Staff from '../../assets/badges/staff.svg';

import style from './storefront.module.css';

type StoreProps = Attributes & {url?: string};
type ItemProps = Attributes & {icon: any; href: string; label: string};

const eligibilityCache: EligibilityStatus | null = null;
function useEligibility() {
	const [eligibility, setEligibility] = useState(eligibilityCache);
	useEffect(() => {
		if (!eligibility) {
			fetch(Endpoints.STORE_FORM_ELIGIBILITY).then(res => {
				if (res.status !== 200) {
					setEligibility({
						publish: 0,
						verification: 1,
						hosting: 1,
						reporting: 1,
					});
					return;
				}

				res.json().then(e => setEligibility(e));
			});
		}
	}, []);

	return eligibility;
}

function Item({icon, href, label}: ItemProps) {
	if (href.startsWith('https')) {
		return (
			<a className={style.item} href={href} target="_blank">
				{h(icon, null)}
				<span>{label}</span>
			</a>
		);
	}

	return (
		<Link class={style.item} activeClassName={style.active} href={href}>
			{h(icon, null)}
			<span>{label}</span>
		</Link>
	);
}

function Sidebar() {
	const user = useContext(UserContext);

	return (
		<Fragment>
			<h1>Replugged Store</h1>
			<Item icon={Plugin} label="Plugins" href={Routes.STORE_PLUGINS} />
			<Item icon={Theme} label="Themes" href={Routes.STORE_THEMES} />
			{/* <Item icon={Yifi} label='Suggestions' href={Routes.STORE_SUGGESTIONS}/> */}

			<h3>Management</h3>
			<Item
				icon={Package}
				label="Your works"
				href={Routes.STORE_MANAGE}
			/>
			{Boolean((user?.flags ?? 0) & UserFlags.STAFF) && (
				<Item
					icon={Staff}
					label="Administration"
					href={Routes.BACKOFFICE_STORE_ITEMS}
				/>
			)}

			<h3>Get in touch</h3>
			<Item
				icon={Upload}
				label="Publish your work"
				href={Routes.STORE_PUBLISH}
			/>
			{/* <Item icon={Verified} label='Get verified' href={Routes.STORE_VERIFICATION}/>
      <Item icon={HardDisk} label='Host a backend' href={Routes.STORE_HOSTING}/> */}

			<div className={style.sideFooter}>
				<a href={Routes.STORE_COPYRIGHT}>Copyright policy</a>
			</div>
		</Fragment>
	);
}

export default function Storefront(props: StoreProps) {
	const eligibility = useEligibility();
	useTitle('%s • Replugged Store');

	return (
		<LayoutWithSidebar>
			<Sidebar />
			<Router url={props?.url}>
				<Store path={Routes.STORE_PLUGINS} kind="plugins" />
				<Store path={Routes.STORE_THEMES} kind="themes" />

				<div path={Routes.STORE_MANAGE}>manage own works</div>

				<PublishForm
					path={Routes.STORE_PUBLISH}
					eligibility={eligibility?.publish}
				/>
				<VerificationForm
					path={Routes.STORE_VERIFICATION}
					eligibility={eligibility?.verification}
				/>
				<HostingForm
					path={Routes.STORE_HOSTING}
					eligibility={eligibility?.hosting}
				/>

				<Redirect default to={Routes.STORE_PLUGINS} />
			</Router>
		</LayoutWithSidebar>
	);
}
