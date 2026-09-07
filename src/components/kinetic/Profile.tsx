"use client";
import Link from "next/link";
import { Media, Reveal, SectionHeading, SystemIcon } from "./Primitives";
import { profile } from "./data";
export default function Profile({ detail = false }: { detail?: boolean }) {
  return (
    <section className="section profile-section" id="identity">
      <Reveal>
        <SectionHeading
          number="01"
          label="IDENTITY"
          title="The person behind the system."
        />
      </Reveal>
      <div className="profile-system">
        <div className="profile-record">
          <p className="eyebrow">PROFILE / FZH—001</p>
          <div className="profile-frame">
            <Media src={profile.image} alt="Farhan Zulkarnain Harahap" />
            <span className="photo-marker">MEDAN / INDONESIA</span>
          </div>
          <p className="profile-signature">Farhan Zulkarnain Harahap</p>
          <span className="eyebrow">
            <span className="status-dot" /> OPEN TO WORK & COLLABORATION
          </span>
        </div>
        <div className="profile-narrative">
          <h3>
            I connect design
            <br />
            with engineering.
          </h3>
          <p>
            I’m Farhan, a full-stack developer based in Medan, Indonesia. I
            build web products from interface to deployment, bringing the
            frontend, backend, and data into one coherent experience.
          </p>
          <div className="profile-fields">
            {[
              [
                "01",
                "FOCUS",
                "Full-stack applications & thoughtful interfaces",
              ],
              [
                "02",
                "APPROACH",
                "Clear structure. Reusable code. Useful details.",
              ],
              [
                "03",
                "CURRENT DIRECTION",
                "API architecture, dashboards & product delivery",
              ],
            ].map(([index, title, value]) => (
              <div key={title}>
                <span className="eyebrow">{index}</span>
                <div>
                  <p className="eyebrow">{title}</p>
                  <p>{value}</p>
                </div>
                <SystemIcon kind="node" />
              </div>
            ))}
          </div>
          <div className="button-row">
            <Link
              className="text-link"
              href={detail ? "/about/docs" : "/about/detail"}
            >
              {detail ? "CV & credentials" : "Explore my profile"} ↗
            </Link>
            <Link className="text-link muted" href="/about/skills">
              Capability graph ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export function Principles() {
  return (
    <section className="section principles">
      <SectionHeading
        number="05"
        label="ENGINEERING PRINCIPLES"
        title="Intent in every layer."
      />
      <div className="principle-grid">
        {[
          [
            "Clarity first.",
            "A useful interface makes the next step obvious. I start with the people and the problem.",
          ],
          [
            "Connected by design.",
            "Interfaces, APIs, and data should share a clear structure, with each part doing its job well.",
          ],
          [
            "Built to evolve.",
            "Reusable components, maintainable code, and responsive layouts leave room for what comes next.",
          ],
        ].map(([title, text], i) => (
          <Reveal key={title}>
            <span className="principle-number">0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
