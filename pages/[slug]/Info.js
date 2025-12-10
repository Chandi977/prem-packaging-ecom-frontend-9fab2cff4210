import React, { useState } from "react";
import {
  faArrowLeft,
  faArrowRight,
  faChevronRight,
  faHeart,
  faHeartbeat,
} from "@fortawesome/free-solid-svg-icons";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import styles from "./page.module.css";
import { he } from "date-fns/locale";

function Info({ product, weight }) {
  console.log("CURRENT PRODUCT: ", product);
  const [value, setValue] = useState("1");
  const [activeTab, setActiveTab] = useState("overview"); // overview open by default

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Build overview fields dynamically depending on category id
  const getOverviewFields = (p, weightVal) => {
    if (!p) return [];

    const safe = (val) =>
      val === undefined || val === null || val === "" ? "Not Available" : val;

    // default common fields (will be filtered if empty)
    const common = [
      { key: "Width (mm)", value: safe(p.breadth_mm) },
      { key: "Length", value: safe(p.length || p.length_mm) },
      { key: "Height (mm)", value: safe(p.height_mm) },
      { key: "Flap (mm)", value: safe(p.flap_mm) },
      { key: "Thickness", value: safe(p.thickness) },
      { key: "Pack Weight (kg)", value: safe(weightVal) },
      { key: "Colour", value: safe(p.color) },
      { key: "Material", value: safe(p.material) },
      { key: "Type", value: safe(p.name) },
      { key: "Labels per Roll", value: safe(p.label_in_roll) },
      { key: "Core Size", value: safe(p.core_size || "1 Inch") },
      { key: "Form", value: safe(p.form || p.type) },
      { key: "HSN Code", value: safe(p.hsn_code) },
      {
        key: "GST",
        value: p.category === "6557deab301ec4f2f4266131" ? "5 %" : "18 %",
      },
    ];

    // category-specific ordered lists (only include relevant fields)
    const map = {
      // Tape categories
      "6557df71301ec4f2f4266145": [
        "Width (mm)",
        "Length",
        "Thickness",
        "Pack Weight (kg)",
        "Colour",
        "Material",
        "Adhesive",
        "HSN Code",
        "GST",
      ],
      "6557df64301ec4f2f4266141": [
        "Width (mm)",
        "Length",
        "Thickness",
        "Pack Weight (kg)",
        "Colour",
        "Material",
        "Adhesive",
        "HSN Code",
        "GST",
      ],
      "6642e8f665f20fe41ab417bc": [
        "Width (mm)",
        "Length",
        "Thickness",
        "Pack Weight (kg)",
        "Colour",
        "Material",
        "Adhesive",
        "HSN Code",
        "GST",
      ],
      // Paper Bag
      "6557df46301ec4f2f4266139": [
        "Length (mm)",
        "Width (mm)",
        "Flap (mm)",
        "Pack Weight (kg)",
        "Colour",
        "Material",
        "Adhesive",
        "HSN Code",
        "GST",
      ],
      // Poly Bag
      "6557df4f301ec4f2f426613d": [
        "Height (mm)",
        "Width (mm)",
        "Flap (mm)",
        "Thickness",
        "Pack Weight (kg)",
        "Colour",
        "Material",
        "Adhesive",
        "HSN Code",
        "GST",
      ],
      // Labels
      "6557deb6301ec4f2f4266135": [
        "Type",
        "Height (mm)",
        "Width (mm)",
        "Labels per Roll",
        "Core Size",
        "Colour",
        "Material",
        "Adhesive",
        "Pack Weight (kg)",
        "HSN Code",
        "GST",
      ],
      // Corrugated box
      "6557deab301ec4f2f4266131": [
        "Type",
        "Height (mm)",
        "Width (mm)",
        "Depth (mm)",
        "Pack Weight (kg)",
        "Colour",
        "Material",
        "HSN Code",
        "GST",
      ],
      // Carry handle tape / other single-purpose categories
      "67cac1fc2a4e1c9ef44a92b5": [
        "Width (mm)",
        "Length (mm)",
        "Pack Weight (kg)",
        "HSN Code",
        "GST",
      ],
      // Food wrapping
      "679ca70f2833ca433fa0aa9c": [
        "Width (mm)",
        "Length (mm)",
        "Pack Weight (kg)",
        "Form",
        "HSN Code",
        "GST",
      ],
      // Carry Bags
      "689d73214687bb4e437542e0": [
        "Length (mm)",
        "Width (mm)",
        "Height (mm)",
        "Pack Weight (kg)",
        "Colour",
        "Material",
        "Adhesive",
        "HSN Code",
        "GST",
      ],
    };

    // fallback: if category is unknown, show a compact subset
    const defaultOrder = [
      "Width (mm)",
      "Length",
      "Height (mm)",
      "Pack Weight (kg)",
      "Colour",
      "Material",
      "HSN Code",
      "GST",
    ];

    const order = map[p.category] || defaultOrder;

    // Special static values mapping (Adhesive values etc.)
    const special = (label) => {
      if (label === "Adhesive") {
        if (
          [
            "6557df71301ec4f2f4266145",
            "6557df64301ec4f2f4266141",
            "6557df46301ec4f2f4266139",
            "6557df4f301ec4f2f426613d",
            "6557deb6301ec4f2f4266135",
            "689d73214687bb4e437542e0",
          ].includes(p.category)
        ) {
          return "Hot Melt Adhesive";
        }
        if (p.category === "6642e8f665f20fe41ab417bc") return "Acrylic";
      }
      return null;
    };

    // Create a map from common by key for easy lookup
    const commonMap = common.reduce((acc, it) => {
      acc[it.key] = it.value;
      return acc;
    }, {});

    // compose final fields in requested order, filter out Not Available if desired
    const fields = order.map((label) => {
      const specialVal = special(label);
      const val = specialVal !== null ? specialVal : commonMap[label];
      return {
        label,
        value: val === undefined || val === null ? "Not Available" : val,
      };
    });

    // ensure reasonable uniqueness and remove entries that are completely empty (if value is "Not Available" you may still want to show — we keep them to match screenshots)
    return fields;
  };

  const overviewFields = getOverviewFields(product, weight);

  const toggleTab = (tab) => {
    setActiveTab((prev) => (prev === tab ? "" : tab));
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row shadow-sm">
          <div
            className="col-12"
            style={{
              border: "1px solid #EBEBEB",
              backgroundColor: "white",
              padding: 16,
            }}
          >
            {/* Headings centered like the provided images */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={() => toggleTab("overview")}
                aria-expanded={activeTab === "overview"}
                aria-controls="overview-panel"
                style={{
                  padding: "8px 20px",
                  borderRadius: 6,
                  border: "1px solid #182C5A",
                  background: activeTab === "overview" ? "#182C5A" : "white",
                  color: activeTab === "overview" ? "white" : "#182C5A",
                  cursor: "pointer",
                }}
              >
                Quick Overview
              </button>

              <button
                type="button"
                onClick={() => toggleTab("details")}
                aria-expanded={activeTab === "details"}
                aria-controls="details-panel"
                style={{
                  padding: "8px 20px",
                  borderRadius: 6,
                  border: "1px solid #182C5A",
                  background: activeTab === "details" ? "#182C5A" : "white",
                  color: activeTab === "details" ? "white" : "#182C5A",
                  cursor: "pointer",
                }}
              >
                Product Details
              </button>
            </div>

            {/* Divider */}
            <hr style={{ borderColor: "#EBEBEB", margin: "8px 0 16px 0" }} />

            {/* Accordion panels (only one may be open at a time) */}
            <div
              id="overview-panel"
              role="region"
              aria-hidden={activeTab !== "overview"}
            >
              {activeTab === "overview" && (
                <>
                  {overviewFields && overviewFields.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {overviewFields.map((f) => (
                        <li
                          key={f.label}
                          style={{
                            padding: "10px 0",
                            borderBottom: "1px solid #F2F2F2",
                            display: "flex",
                            gap: 12,
                          }}
                        >
                          <strong style={{ color: "#182C5A", minWidth: 160 }}>
                            {f.label}
                          </strong>
                          <span
                            style={{
                              color: "#555555",
                              textTransform: "capitalize",
                            }}
                          >
                            {f.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "#555555" }}>Not Available</p>
                  )}
                </>
              )}
            </div>

            <div
              id="details-panel"
              role="region"
              aria-hidden={activeTab !== "details"}
            >
              {activeTab === "details" && (
                <div
                  className="mt-2"
                  dangerouslySetInnerHTML={{
                    __html: product?.description
                      ? product.description
                      : '<h5 class="text-center mt-5">Not Available</h5>',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Info;
