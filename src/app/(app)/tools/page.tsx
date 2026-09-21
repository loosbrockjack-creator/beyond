import Link from "next/link";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { loadCourse } from "@/lib/course";
import { createClient } from "@/lib/supabase/server";
import { Page, PageTitle } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { formatDate } from "@/lib/schedule";

export default async function ToolsPage() {
  const course = await loadCourse();
  const supabase = await createClient();

  const [{ data: tools }, { data: resources }] = await Promise.all([
    supabase.from("tools").select("*, tool_topics(topic_id)").order("order_index"),
    supabase.from("resources").select("*").order("created_at", { ascending: false }),
  ]);

  const all = tools ?? [];
  const launch = all.filter((t) => t.kind === "launch");
  const directory = all.filter((t) => t.kind === "directory");

  const categories = [...new Set(directory.map((t) => t.category))];
  const topicById = new Map(course.topics.map((t) => [t.topic.id, t]));

  return (
    <Page wide>
      <PageTitle
        label="Course"
        title="Tools"
        lead="What to reach for, where to log in, and everything worth keeping from sixteen weeks of research."
      />

      <section className="mb-16">
        <SectionHeader>Quick launch</SectionHeader>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {launch.map((t) => (
            <a
              key={t.id}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-3 border border-line bg-surface px-4 py-3.5 transition-colors duration-150 hover:border-line-strong hover:bg-raised"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink">{t.name}</span>
                <span className="mt-0.5 block truncate text-xs text-muted">{t.description}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-faint transition-colors duration-150 group-hover:text-ink" />
            </a>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader right={`${directory.length} tools`}>Directory</SectionHeader>
        <div className="mt-6 flex flex-col gap-10">
          {categories.map((category) => (
            <div key={category}>
              <span className="label">{category}</span>
              <ul className="mt-3">
                {directory
                  .filter((t) => t.category === category)
                  .map((t) => {
                    const linked = t.tool_topics
                      .map((tt) => topicById.get(tt.topic_id))
                      .filter((x): x is NonNullable<typeof x> => Boolean(x));

                    return (
                      <li key={t.id} className="border-b border-line">
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start justify-between gap-6 py-3.5 transition-colors duration-150 hover:bg-raised"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm text-ink">{t.name}</span>
                            <span className="mt-0.5 block text-xs text-muted">{t.description}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-3">
                            {linked.length > 0 ? (
                              <span className="num hidden text-2xs text-faint sm:inline">
                                {linked
                                  .map((l) => String(l.topic.number).padStart(2, "0"))
                                  .join(" · ")}
                              </span>
                            ) : null}
                            <ExternalLink className="size-3.5 text-faint" aria-hidden="true" />
                          </span>
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader right={`${resources?.length ?? 0} saved`}>Resource locker</SectionHeader>
        {resources && resources.length > 0 ? (
          <ul className="mt-2">
            {resources.map((r) => {
              const topic = r.topic_id ? topicById.get(r.topic_id) : undefined;
              return (
                <li key={r.id} className="border-b border-line">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-6 py-3.5 transition-colors duration-150 hover:bg-raised"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-ink">{r.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {topic ? (
                          <Link
                            href={`/m/${topic.moduleSlug}/topics/${topic.topic.slug}`}
                            className="hover:text-ink"
                          >
                            {topic.topic.title}
                          </Link>
                        ) : null}
                        {r.note ? ` · ${r.note}` : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      {r.consumed_at ? <span className="label">read</span> : null}
                      <span className="num w-14 text-right text-xs text-faint">
                        {formatDate(new Date(r.created_at))}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted">
            Nothing saved yet. Links you collect while researching a topic land here.
          </p>
        )}
      </section>
    </Page>
  );
}
