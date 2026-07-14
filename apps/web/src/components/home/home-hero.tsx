'use client';

import Image from 'next/image';
import Link from 'next/link';

import { HOME_ASSETS } from '@/lib/assets/home';
import { useTranslations } from '@/lib/i18n/use-translations';

export function HomeHero() {
  const t = useTranslations();
  const shapes = HOME_ASSETS.shapes;

  return (
    <section className="pb-banner-section">
      <div
        className="pb-pattern-layer"
        style={{ backgroundImage: `url(${shapes.pattern})` }}
      />

      <div className="pb-anim-icon" aria-hidden="true">
        <div
          className="pb-anim-1 pb-float-bob-y"
          style={{ backgroundImage: `url(${shapes.anim1})` }}
        />
        <div
          className="pb-anim-2"
          style={{ backgroundImage: `url(${shapes.anim2})` }}
        />
        <div
          className="pb-anim-3 pb-rotate-me"
          style={{ backgroundImage: `url(${shapes.anim3})` }}
        />
        <div
          className="pb-anim-4 pb-rotate-me"
          style={{ backgroundImage: `url(${shapes.anim3})` }}
        />
        <div
          className="pb-anim-5 pb-rotate-me"
          style={{ backgroundImage: `url(${shapes.anim3})` }}
        />
        <div
          className="pb-anim-6 pb-rotate-me"
          style={{ backgroundImage: `url(${shapes.anim3})` }}
        />
        <div
          className="pb-anim-7 pb-float-bob-x"
          style={{ backgroundImage: `url(${shapes.anim6})` }}
        />
        <div
          className="pb-anim-8"
          style={{ backgroundImage: `url(${shapes.anim7})` }}
        />
        <div
          className="pb-anim-9 pb-zoom-fade"
          style={{ backgroundImage: `url(${shapes.anim8})` }}
        />
        <div
          className="pb-anim-10 pb-float-bob-y"
          style={{ backgroundImage: `url(${shapes.anim9})` }}
        />
        <div
          className="pb-anim-11 pb-zoom-fade"
          style={{ backgroundImage: `url(${shapes.anim10})` }}
        />
      </div>

      <div className="pb-large-container">
        <div className="pb-banner-grid">
          <div className="pb-image-box">
            <Image
              src={HOME_ASSETS.banner}
              alt={t.home.hero.imageAlt}
              width={556}
              height={556}
              priority
              className="h-auto w-full"
            />
          </div>

          <div className="pb-content-box w-[90%]">
            <h2>{t.home.hero.title}</h2>

            <div className="pb-hero-cta">
              <Link href="/shop" className="pb-theme-btn">
                {t.home.hero.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
