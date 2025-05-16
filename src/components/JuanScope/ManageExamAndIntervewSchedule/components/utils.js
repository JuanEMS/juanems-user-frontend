import { Skeleton } from "antd";

// Academic level options
export const ACADEMIC_LEVEL_OPTIONS = [
  { text: "Grade 11", value: "Grade 11" },
  { text: "Grade 12", value: "Grade 12" },
];

// Academic strand options
export const ACADEMIC_STRAND_OPTIONS = [
  { value: "STEM", label: "STEM" },
  { value: "HUMSS", label: "HUMSS" },
  { value: "ABM", label: "ABM" },
  { value: "TVL", label: "TVL" },
  { value: "GAS", label: "GAS" },
];


// Status tag colors mapping
export const STATUS_COLORS = {
  Complete: "success",
  Incomplete: "warning",
  Pending: "processing",
  "On-going": "blue",
  Required: "error",
  Approved: "green",
  Rejected: "red",
  "On Waiting List": "warning",
};


export const TableSkeleton = () => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-header">
        {Array(6)
          .fill(null)
          .map((_, index) => (
            <div key={`header-${index}`} className="skeleton-cell">
              <Skeleton.Button active style={{ width: "100%", height: 32 }} />
            </div>
          ))}
      </div>

      {Array(5)
        .fill(null)
        .map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="skeleton-row">
            {Array(6)
              .fill(null)
              .map((_, cellIndex) => (
                <div
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className="skeleton-cell"
                >
                  <Skeleton.Button
                    active
                    style={{ width: "100%", height: 24 }}
                  />
                </div>
              ))}
          </div>
        ))}

      <div className="skeleton-pagination">
        <Skeleton.Button active style={{ width: 300, height: 32 }} />
      </div>

      <style jsx>{`
        .skeleton-table {
          width: 100%;
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .skeleton-header,
        .skeleton-row {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 0.8fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .skeleton-cell {
          min-height: 24px;
        }
        .skeleton-pagination {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

// Common utility constants and functions



// Helper function to format date strings
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return "Invalid Date";
  }
};

// Get row class name based on application status
export const getRowClassName = (record) => {
  const status = record.admissionExamDetailsStatus;
  if (status === "Approved") return "bg-green-50";
  if (status === "Rejected") return "bg-red-50";
  if (status === "On Waiting List") return "bg-yellow-50";
  return "";
};