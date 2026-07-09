import { useMemo, useState } from 'preact/hooks';

export const ALL_TOPICS = '__all__';

export interface ContentFilterItem {
  domain: string;
  topic: string;
}

export interface ContentFilterOption {
  topic: string;
  count: number;
}

/**
 * Shared domain -> topic filtering, used by every "Study" wrapper
 * (Flashcard/MCQ/CLI). Selecting a domain resets the topic to "all topics
 * in this domain" rather than an arbitrary first topic.
 */
export function useContentFilter<T extends ContentFilterItem>(items: T[]) {
  const domains = useMemo(() => {
    const seen = new Map<string, number>();
    for (const item of items) seen.set(item.domain, (seen.get(item.domain) ?? 0) + 1);
    return [...seen.entries()].map(([domain, count]) => ({ domain, count }));
  }, [items]);

  const [selectedDomain, setSelectedDomainState] = useState(domains[0]?.domain ?? '');
  const [selectedTopic, setSelectedTopic] = useState<string>(ALL_TOPICS);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  function setSelectedDomain(domain: string) {
    setSelectedDomainState(domain);
    setSelectedTopic(ALL_TOPICS);
  }

  const domainItems = useMemo(
    () => items.filter((item) => item.domain === selectedDomain),
    [items, selectedDomain]
  );

  const topics = useMemo<ContentFilterOption[]>(() => {
    const seen = new Map<string, number>();
    for (const item of domainItems) seen.set(item.topic, (seen.get(item.topic) ?? 0) + 1);
    return [...seen.entries()].map(([topic, count]) => ({ topic, count }));
  }, [domainItems]);

  const filteredItems = useMemo(
    () => (selectedTopic === ALL_TOPICS ? domainItems : domainItems.filter((item) => item.topic === selectedTopic)),
    [domainItems, selectedTopic]
  );

  return {
    domains,
    selectedDomain,
    setSelectedDomain,
    domainItems,
    topics,
    selectedTopic,
    setSelectedTopic,
    filteredItems,
    shuffleSeed,
    reshuffle: () => setShuffleSeed((s) => s + 1),
  };
}
