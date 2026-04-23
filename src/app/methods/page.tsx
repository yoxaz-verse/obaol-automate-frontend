"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  LuTarget, 
  LuLayers, 
  LuGlobe, 
  LuActivity, 
  LuZap,
  LuShieldCheck,
  LuUser
} from "react-icons/lu";
import "./methods.css";

const protocols = [
  {
    id: "01",
    title: "The Enquiry Protocol",
    description: "Using live market enquiries as the bridge. Suppliers find value when conversations center around a tangible exchange. It's not a cold call; it's a value injection.",
    icon: <LuTarget size={32} />,
    highlights: ["Value-First Contact", "Bridge Connectivity", "Engagement Arbitrage"]
  },
  {
    id: "02",
    title: "Product Mastery",
    description: "Dominating a specific commodity space. Shared intelligence on geographical and seasonal circumstances establishes you as a strategic consultant rather than a data operator.",
    icon: <LuLayers size={32} />,
    highlights: ["Domain Authority", "Insight Transmission", "Strategic Stance"]
  },
  {
    id: "03",
    title: "Regional Protocol",
    description: "Leveraging regional identity to bypass cold communication barriers. Cultural trust and native identity create an immediate personal connection that transcends business norms.",
    icon: <LuGlobe size={32} />,
    highlights: ["Cultural Trust", "Native Identity", "Localized Influence"]
  }
];

export default function MethodsPage() {
  return (
    <div className="methods-container">
      <div className="star-field" />
      <div className="grid-overlay" />

      <header className="header">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="tagline">Execution Operational Framework</span>
          <h1>Relationship Methods</h1>
        </motion.div>
      </header>

      <section className="methods-grid">
        {protocols.map((protocol, index) => (
          <motion.div
            key={protocol.id}
            className="method-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <span className="method-number">PROTOCOL {protocol.id}</span>
            <div className="method-icon">{protocol.icon}</div>
            <h2>{protocol.title}</h2>
            <p>{protocol.description}</p>
            <div className="method-highlights">
              {protocol.highlights.map((h, i) => (
                <div key={i} className="highlight-item">
                  <div className="highlight-dot" />
                  <span className="highlight-text">{h}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      <motion.section 
        className="manifesto-section"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3>Operator Mindset Protocol</h3>
        <blockquote>
          "You are not an operator; you are a <span>Sync Team Member</span>. You do not just manage data—you take 100% ownership of the <span>companies success</span> under your management."
        </blockquote>
        
        <div className="manifesto-footer">
          <div className="footer-item">
            <div className="footer-label">Operational Identity</div>
            <div className="footer-value italic">Entrepreneurial Sync</div>
          </div>
          <div className="footer-item">
            <div className="footer-label">Engagement Metric</div>
            <div className="footer-value">Value-Driven Persistence</div>
          </div>
          <div className="footer-item">
            <div className="footer-label">End Goal</div>
            <div className="footer-value">Total Platform Integration</div>
          </div>
        </div>
      </motion.section>

      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, display: 'flex', gap: '1rem', opacity: 0.4 }}>
        <LuZap size={20} className="text-primary" />
        <LuShieldCheck size={20} className="text-secondary" />
        <LuUser size={20} className="text-success" />
      </div>

    </div>
  );
}
