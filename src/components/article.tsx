import type { Article } from "@/content/types";

/** Long-form reading: one measure, clear headings, nothing decorative. */
export function ArticleBody({ article }: { article: Article }) {
  return (
    <div className="max-w-[68ch]">
      {article.sections.map((section) => (
        <section key={section.heading} id={section.id} className="mt-12 first:mt-0">
          <h2 className="type-title text-2xl">{section.heading}</h2>
          {section.paragraphs?.map((text) => (
            <p key={text} className="mt-4 text-lg">
              {text}
            </p>
          ))}
          {section.list ? (
            <ul className="mt-4 border-t border-rule">
              {section.list.map((item) => (
                <li key={item} className="border-b border-rule py-3 text-lg">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {section.after?.map((text) => (
            <p key={text} className="mt-4 text-lg">
              {text}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
