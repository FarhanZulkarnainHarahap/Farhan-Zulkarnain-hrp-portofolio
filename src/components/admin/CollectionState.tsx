"use client";
export function CollectionState({
  loading,
  error,
  retry,
  empty = false,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
  empty?: boolean;
}) {
  if (loading)
    return (
      <div className="collection-state" role="status">
        <span className="loading-line" />
        Loading collection…
      </div>
    );
  if (error)
    return (
      <div className="collection-state" role="alert">
        <p>{error}</p>
        <button className="button secondary" onClick={retry}>
          Retry connection ↗
        </button>
      </div>
    );
  if (empty)
    return <div className="collection-state">No entries published yet.</div>;
  return null;
}
