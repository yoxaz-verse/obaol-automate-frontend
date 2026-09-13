import { FiCheck, FiPackage, FiArrowUpRight, FiLayers } from "react-icons/fi";
import { PublicLinkButton } from "@/components/public/PublicUI";

const milestones = [
  { title: "Sampling & coordination", detail: "Product sample and supplier confirmation", status: "Completed" },
  { title: "Procurement & quality", detail: "Purchase commitment and quality checks", status: "Completed" },
  { title: "Packaging", detail: "Preparing the order for dispatch", status: "In progress" },
  { title: "Inland transport & freight", detail: "Shipment coordination and handoff", status: "Upcoming" },
];

export default function ExecutionPreview() {
  return (
    <figure data-hero-panel="unified-system" className="execution-preview">
      <figcaption className="execution-preview-caption">
        <span className="public-eyebrow">One connected workspace</span>
        <span>All execution stages, tracked in one OBAOL workspace.</span>
      </figcaption>
      <div className="execution-preview-window">
        <div className="execution-preview-toolbar">
          <span className="inline-flex items-center gap-2 font-semibold"><FiLayers aria-hidden="true" /> OBAOL <span className="font-normal public-muted">/ Trade workspace</span></span>
          <span className="execution-demo-label">Illustrative preview</span>
        </div>
        <div className="execution-preview-body">
          <div className="execution-preview-summary">
            <p className="public-eyebrow">Execution overview</p>
            <h3>Every handoff.<br />In clear view.</h3>
            <p className="public-muted">From sample approval to shipment, keep the next step visible in one shared order.</p>
            <dl className="execution-order-details">
              <div><dt>Example order</dt><dd>OB-2024-0771</dd></div>
              <div><dt>Commodity</dt><dd>Premium cacao beans</dd></div>
              <div><dt>Shipment</dt><dd>1 × 20ft container</dd></div>
            </dl>
            <PublicLinkButton href="/how-it-works" variant="secondary">Explore the workflow <FiArrowUpRight aria-hidden="true" /></PublicLinkButton>
          </div>
          <div className="execution-preview-progress">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">Order milestones</h3>
              <span className="execution-status execution-status--active">Packaging in progress</span>
            </div>
            <ol className="execution-milestones">
              {milestones.map((milestone, index) => (
                <li key={milestone.title} aria-current={index === 2 ? "step" : undefined}>
                  <span className={`execution-step execution-step--${index < 2 ? "complete" : index === 2 ? "active" : "upcoming"}`} aria-hidden="true">
                    {index < 2 ? <FiCheck /> : index === 2 ? <FiPackage /> : "04"}
                  </span>
                  <div className="min-w-0"><h4>{milestone.title}</h4><p>{milestone.detail}</p></div>
                  <span className={`execution-milestone-status ${index < 2 ? "execution-complete" : ""}`}>{milestone.status}</span>
                </li>
              ))}
            </ol>
            <p className="execution-preview-note">A shared view of progress, responsibilities, and what comes next.</p>
          </div>
        </div>
      </div>
    </figure>
  );
}
