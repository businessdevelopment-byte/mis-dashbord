import React from "react";
import { Download } from "lucide-react";
import { generateDashboardPDF } from "../../../utils/pdfGenerator";
import DailyReportButton from "./DailyReportButton";

const DashboardHeader = ({
    user,
    ALL_COLUMNS,
    visibleColumns,
    filteredEmployees,
    employeeCommitments,
    topWorstPerformers,
    topBestPerformers,
    pendingTasks,
    departmentScores = [],
    dataSheetRows = [],
    dataSheetDateRange,
}) => {
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const formatDate = (value) => {
        const rawDate = String(value || "").trim();
        if (!rawDate) return "";

        let date;
        const isoDate = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        const dayFirstDate = rawDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);

        if (isoDate) {
            date = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
        } else if (dayFirstDate) {
            date = new Date(Number(dayFirstDate[3]), Number(dayFirstDate[2]) - 1, Number(dayFirstDate[1]));
        } else {
            date = new Date(rawDate);
        }

        if (isNaN(date.getTime())) return rawDate;
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(date).replace(/\s/g, "-");
    };
    const fromDate = formatDate(dataSheetDateRange?.fromDate);
    const toDate = formatDate(dataSheetDateRange?.toDate);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-800">
                    {isAdmin ? "Admin Dashboard" : (user?.role === 'hod' ? "HOD Dashboard" : "Employee Dashboard")}
                </h1>
                {fromDate && toDate && (
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Report From {fromDate} To {toDate}
                    </p>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                <DailyReportButton dataSheetRows={dataSheetRows} />
                <button
                    onClick={() => {
                        const visibleColsList = ALL_COLUMNS.filter(col =>
                            visibleColumns[col.key] &&
                            !["nextWeekPlannedNotDone", "nextWeekPlannedNotDoneOnTime", "nextWeekCommitment"].includes(col.key)
                        );
                        const exportData = filteredEmployees.map(emp => ({
                            ...emp,
                            nextWeekPlannedWorkNotDone: employeeCommitments[emp.id]?.nextWeekPlannedWorkNotDone || emp.nextWeekPlannedWorkNotDone,
                            nextWeekPlannedWorkNotDoneOnTime: employeeCommitments[emp.id]?.nextWeekPlannedWorkNotDoneOnTime || emp.nextWeekPlannedWorkNotDoneOnTime,
                            nextWeekCommitment: employeeCommitments[emp.id]?.commitment || emp.nextWeekCommitment
                        }));
                        generateDashboardPDF(
                            visibleColsList,
                            exportData,
                            topBestPerformers,
                            pendingTasks,
                            topWorstPerformers,
                            departmentScores
                        );
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
