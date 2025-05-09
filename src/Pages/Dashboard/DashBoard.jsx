import React, { useEffect, useState, useCallback } from "react";
import { Card, Select, DatePicker, Modal } from "antd";
import { Column } from '@ant-design/plots';
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Header from "../../Components/Header";
import Content from "../../Components/Content";
import Footer from "../../Components/Footer";
import axios from "axios";
import Cookies from "js-cookie";
import "./dashboard.css";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const { Option } = Select;

const DashBoard = () => {
  const [data, setData] = useState(null);
  const [bardata, setBarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [barLoading, setBarLoading] = useState(false);
  const [error, setError] = useState(null);
  const [barError, setBarError] = useState(null);
  const [filterType, setFilterType] = useState("quarter");
  const [startYear, setStartYear] = useState(null);
  const [endYear, setEndYear] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        window.url + "dashboard/getDashboardSummary",
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      setData(response.data);
      console.log("Order Status Breakdown Data:", response.data.orderStatusBreakdown);
    } catch (err) {
      if (err.response?.data?.message === "Token expired, please login again") {
        setSessionExpired(true);
      }
      setError(
        `Failed to fetch dashboard data: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchBardata = useCallback(async () => {
    setBarLoading(true);
    setBarError(null);
    try {
      const response = await axios.post(
        window.url + "dashboard/getBarChart",
        {
          type: filterType,
          ...(filterType === "year" ? { startYear, endYear } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      setBarData(response.data);
    } catch (err) {
      if (err.response?.data?.message === "Token expired, please login again") {
        setSessionExpired(true);
      } else {
        setBarError(
          `Failed to fetch bar chart data: ${err.response?.data?.message || err.message}`
        );
      }
    } finally {
      setBarLoading(false);
    }
  }, [filterType, startYear, endYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchBardata();
  }, [fetchBardata]);

  const BarChartSection = () => (
    <Card title="Orders Trend" bordered={false}>
      <div style={{ marginBottom: '0.5rem' }}>
        <Select
          value={filterType}
          onChange={(value) => {
            setFilterType(value);
            if (value !== "year") {
              setStartYear(null);
              setEndYear(null);
            }
          }}
          style={{ width: 150, marginRight: 10 }}
        >
          <Option value="month">Month</Option>
          <Option value="year">Year</Option>
          <Option value="quarter">Quarter</Option>
          <Option value="half-year">Half-Year</Option>
        </Select>

        {filterType === "year" && (
          <>
            <DatePicker
              picker="year"
              value={startYear ? dayjs(startYear, "YYYY") : null}
              onChange={(date, dateString) => setStartYear(dateString)}
              placeholder="Start Year"
              style={{ width: 120, marginRight: 10 }}
            />
            <DatePicker
              picker="year"
              value={endYear ? dayjs(endYear, "YYYY") : null}
              onChange={(date, dateString) => setEndYear(dateString)}
              placeholder="End Year"
              style={{ width: 120, marginRight: 10 }}
            />
          </>
        )}
      </div>

      {barLoading && <div>Loading bar chart...</div>}
      {barError && <div>{barError}</div>}
      {!barLoading && !barError && (
        <Column
          data={
            Array.isArray(bardata?.ordersByPeriod)
              ? bardata.ordersByPeriod.map(({ period, orderCount }) => ({
                  period,
                  orderCount: parseInt(orderCount, 10),
                }))
              : []
          }
          xField="period"
          yField="orderCount"
          height={280} /* Increased to match Doughnut */
          style={{ fill: "#03dcc5" }}
        />
      )}
    </Card>
  );

  const orderStatusData = Object.entries(data?.orderStatusBreakdown || {}).map(
    ([key, value]) => ({ type: key, value: parseFloat(value) })
  );

  const statusColors = {
    order: "#03dcc5",
    sketch: "#f9de71",
    cad: "#18c7b2",
    render: "#d1f554",
    design: "#f49f58",
  };

  const doughnutData = {
    labels: orderStatusData.map((item) => item.type),
    datasets: [
      {
        data: orderStatusData.map((item) => item.value),
        backgroundColor: orderStatusData.map((item) => statusColors[item.type] || "#20c99a"),
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value} orders`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    cutout: "50%",
  };

  const handleViewOrder = (id) => {
    navigate(`/vieworder/${id}`);
  };

  const handleSessionExpired = () => {
    Cookies.remove("authToken");
    setSessionExpired(false);
    navigate("/login");
  };

  return (
    <main className="main-content">
      <Content>
        <div className="">
          {loading && <div>Loading dashboard...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
          {!loading && !error && (
            <>
              <div className="dashboard-grid dashboard-grid-cols-4">
                <Card className="custom-card total-orders" title="Total Orders" bordered={false}>
                  <h2>{data?.totalOrders || 0}</h2>
                </Card>
                <Card className="custom-card total-orders" title="Orders in Progress" bordered={false}>
                  <h2>{data?.ordersInProgress || 0}</h2>
                </Card>
                <Card className="custom-card total-orders" title="Completed Orders" bordered={false}>
                  <h2>{data?.completedOrders || 0}</h2>
                </Card>
                <Card className="custom-card total-orders" title="Total Customers" bordered={false}>
                  <h2>{data?.totalCustomers || 0}</h2>
                </Card>
              </div>

              <div className="dashboard-grid dashboard-grid-cols-2">
                <Card title="Order Progress" bordered={false}>
                  <Doughnut data={doughnutData} options={doughnutOptions} style={{width:"90%"}} />
                </Card>
                <BarChartSection />
              </div>

              <div className="dashboard-grid dashboard-grid-cols-1">
                <Card title="Recent Orders" bordered={false}>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover recent-orders-table">
                      <thead>
                        <tr>
                          <th>Order No</th>
                          <th>Status</th>
                          <th>Customer Name</th>
                          <th>Designer Name</th>
                          <th>Promised Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.recentOrders?.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <span
                                className="order-link"
                                onClick={() => handleViewOrder(row.id)}
                                role="button"
                                aria-label={`View order ${row.orderNo}`}
                              >
                                {row.orderNo}
                              </span>
                            </td>
                            <td>{row.orderStatus}</td>
                            <td>{row.customerName}</td>
                            <td>
                              {(() => {
                                if (!row.designerName || (Array.isArray(row.designerName) && row.designerName.length === 0)) {
                                  return <div>No designer</div>;
                                }
                                if (Array.isArray(row.designerName)) {
                                  return row.designerName.map((designer, index) => (
                                    <div key={index}>
                                      {typeof designer === "string" ? designer : designer.designerName || "Unknown"}
                                    </div>
                                  ));
                                }
                                return <div>{row.designerName}</div>;
                              })()}
                            </td>
                            <td>{row.promiseDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </Content>
      <Footer />

      <Modal
        title="Session Expired"
        open={sessionExpired}
        onOk={handleSessionExpired}
        onCancel={handleSessionExpired}
        okText="Login Again"
        cancelText="Cancel"
      >
        <p>Your session has expired. Please log in again to continue.</p>
      </Modal>
    </main>
  );
};

export default DashBoard;