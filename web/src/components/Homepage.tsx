import {h} from 'preact';
import {useTitle} from 'hoofd/preact';

import {Routes} from '../constants';

import Zap from 'feather-icons/dist/icons/zap.svg';
import MessageCircle from 'feather-icons/dist/icons/message-circle.svg';
import ArrowRight from 'feather-icons/dist/icons/arrow-right.svg';
import Feather from 'feather-icons/dist/icons/feather.svg';
import Home from 'feather-icons/dist/icons/home.svg';
import PenTool from 'feather-icons/dist/icons/pen-tool.svg';

import Plugin from '../assets/icons/plugin.svg';
import Theme from '../assets/icons/brush.svg';

import style from './homepage.module.css';
import sharedStyle from './shared.module.css';

type FeatureProps = {
	icon: any;
	title: string;
	description: string;
	note?: string;
	link?: {
		href: string;
		label: string;
	};
};

function Feature({icon, title, description, note, link}: FeatureProps) {
	return (
		<section className={style.feature}>
			<div className={style.featureIcon}>{h(icon, null)}</div>
			<h3 className={style.featureTitle}>{title}</h3>
			<p className={style.featureDescription}>{description}</p>
			{note && <p className={style.note}>{note}</p>}
			{link && (
				<a href={link.href} className={style.featureLink}>
					<ArrowRight />
					<span>{link.label}</span>
				</a>
			)}
		</section>
	);
}

export default function Homepage() {
	useTitle('Home');

	return (
		<main className={style.container}>
			<div className={style.heading}>
				<div className={style.wrapper}>
					<h1 className={style.title}>
						Powerful and simple Discord client mod
					</h1>
					<p className={style.motto}>
						Enhance your Discord experience with new features and
						looks. Make your Discord truly yours.
					</p>
					<div className={style.buttons}>
						<a
							href={Routes.DOWNLOAD}
							className={sharedStyle.button}
						>
							{/* @ts-ignore */}
							<Zap className={sharedStyle.icon} />
							<span>Download</span>
						</a>
						<a
							href={Routes.DICKSWORD}
							className={sharedStyle.buttonLink}
						>
							{/* @ts-ignore */}
							<MessageCircle className={sharedStyle.icon} />
							<span>Discord Server</span>
						</a>
					</div>
				</div>
			</div>

			<div className={style.wrapper}>
				<section className={style.section}>
					<h2 className={style.sectionTitle}>
						Zero-compromise experience
					</h2>
					<p className={style.sectionDescription}>
						Replugged has everything you need to enhance your
						Discord client, without compromising on performance or
						security.
					</p>

					<div className={style.features}>
						<Feature
							icon={Plugin}
							title="Plugins"
							description="Add new features to your Discord client, or enhance already existing ones by extending them. You can even write your own plugins!"
							// link={{ href: Routes.STORE_PLUGINS, label: 'Explore available plugins' }}
						/>
						<Feature
							icon={Theme}
							title="Themes"
							description={
								"Give your Discord client a fresh new look, that matches your taste. You're no longer limited by what Discord gave you, only imagination!"
							}
							// link={{ href: Routes.STORE_THEMES, label: 'Explore available themes' }}
						/>
						<Feature
							icon={PenTool}
							title="Customizable"
							description={
								"Plugins and themes are fully customizable, through easy-to-use interfaces, allowing you to turn your Discord client into what you want, whatever that is. Unnecessary feature? Disable it. Don't like the color? Change it."
							}
						/>
						<Feature
							icon={Feather}
							title="Lightweight"
							description={
								'Replugged is designed to consume as little resources as possible, and provides to plugin developers powerful tools to build efficient and robust plugins.'
							}
							note={
								"Note that Replugged still runs on top of the official client, and can't magically make it lighter. We just do our best to not consume even more resources."
							}
						/>
						<Feature
							icon={Home}
							title="Feels like home"
							description={
								"We try to integrate as smoothly as possible within Discord's design language. Every modded element feels like it always has been there. You'll almost forget you're running a modded client!"
							}
						/>
						{/* <Feature
              icon={Shield}
              title='Secure by design'
              description={'Plugins are reviewed to ensure no malicious plugin can make its way through.'}
            /> */}
					</div>
				</section>
				<hr />
				{/* <section className={style.section}>
                    <h2 className={style.sectionTitle}>Powerful APIs for amazing plugins</h2>
                    <p className={style.sectionDescription}>
                        Replugged gives plugin and theme developers the tools they need to build their next amazing plugin or theme.
                    </p>
                    <div className={style.features}>
                        <Feature
                            icon={Coffee}
                            title='Standard library'
                            description={'Don\'t struggle with basic setup or boilerplate code. Replugged already provies everything you need to get started and do your patchwork.'}
                            link={{ href: Routes.DOCS, label: 'Read the documentation' }}
                        />
                        <Feature
                            icon={BatteryCharging}
                            title='Efficient code'
                            description={'An efficient plugin keeps users happy, their Discord client speedy, and preserves their laptop\'s battery. Replugged gives you in-depth insights and detects inefficient code to help you make better and more efficient plugins.'}
                        />
                        <Feature
                            icon={Disc}
                            title='Error handling'
                            description={'Discord is a rolling-release product and injections can quickly go wrong. Replugged has built-in error handling that is designed to ensure plugins cannot brick Discord clients. No more crashes, or at least way fewer.'}
                        />
                    </div>
                </section>
                <hr /> */}
				<section className={style.section}>
					<h2 className={style.sectionTitle}>
						Make your Discord spicer
					</h2>
					<p className={style.sectionDescription}>
						Stop limiting yourself to what Discord gives you. Get
						Replugged!
					</p>
					<div className={sharedStyle.buttons}>
						<a
							href={Routes.DOWNLOAD}
							className={sharedStyle.button}
						>
							{/* @ts-ignore */}
							<Zap className={sharedStyle.icon} />
							<span>Download</span>
						</a>
						<a
							href={Routes.DICKSWORD}
							className={sharedStyle.buttonLink}
						>
							{/* @ts-ignore */}
							<MessageCircle className={sharedStyle.icon} />
							<span>Discord Server</span>
						</a>
					</div>
				</section>
			</div>
		</main>
	);
}
