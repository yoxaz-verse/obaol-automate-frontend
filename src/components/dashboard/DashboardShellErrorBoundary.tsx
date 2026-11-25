"use client";

import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export default class DashboardShellErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== "production") console.error(error);
    window.dispatchEvent(new CustomEvent("obaol:navigation-error", {
      detail: { route: window.location.pathname, shell: true },
    }));
  }

  private retry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  private signIn = () => {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/auth?view=signin&returnTo=${encodeURIComponent(returnTo)}`);
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="db-bg flex min-h-screen items-center justify-center p-6">
        <section className="w-full max-w-xl rounded-3xl border border-danger-200 bg-content1 p-8 text-center shadow-sm dark:border-danger-500/30">
          <h1 className="text-2xl font-black text-foreground">This workspace could not be displayed</h1>
          <p className="mt-3 text-sm text-default-500">
            Retry the workspace. If your session has expired, sign in again and we will return you here.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={this.retry} className="rounded-xl bg-obaol-600 px-5 py-3 text-sm font-bold text-white">
              Retry workspace
            </button>
            <button type="button" onClick={this.signIn} className="rounded-xl border border-default-300 px-5 py-3 text-sm font-bold text-foreground">
              Sign in again
            </button>
          </div>
        </section>
      </main>
    );
  }
}
