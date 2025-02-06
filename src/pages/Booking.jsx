import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar';

const BookingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState([false, false, false, false]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);

  const steps = ["Branch", "Date & Time", "Staff", "Complete Booking"];

  // Fetch branches and employees from the API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches'); // Replace with your actual API endpoint
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees'); // Replace with your actual API endpoint
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchBranches();
    fetchEmployees();
  }, []);

  const timeSlots = [
    { time: "08:00 am", available: true },
    { time: "08:30 am", available: true },
    { time: "09:00 am", available: false },
    { time: "09:30 am", available: true },
    { time: "10:00 am", available: false },
    { time: "10:30 am", available: true },
    { time: "11:00 am", available: true },
    { time: "11:30 am", available: true },
  ];

  const handleNavigation = (direction) => {
    if (direction === "prev" && activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else if (direction === "next" && activeStep < steps.length - 1 && stepCompleted[activeStep]) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleCompleteStep = () => {
    const updatedSteps = [...stepCompleted];
    updatedSteps[activeStep] = true;
    setStepCompleted(updatedSteps);
  };

  const handleApplyPromoCode = () => {
    if (promoCode.trim() === "DISCOUNT10") {
      setPromoApplied(true);
      alert("Promo code applied successfully!");
    } else {
      setPromoApplied(false);
      alert("Invalid promo code. Please try again.");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9" }}>
      <Navbar />

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "12px",
          margin: "20px auto",
          maxWidth: "800px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          {/* Background Line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "10%",
              right: "10%",
              height: "4px",
              backgroundColor: "#ddd",
              zIndex: 0,
              transform: "translateY(-50%)",
            }}
          />
          {/* Dynamic Progress Line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "10%",
              height: "4px",
              backgroundColor: "#28a745",
              zIndex: 1,
              transform: "translateY(-50%)",
              width: `${(stepCompleted.filter((completed) => completed).length / steps.length) * 80}%`,
              transition: "width 0.3s ease-in-out",
            }}
          />
          {/* Progress Steps */}
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: "50%",
                left: `${10 + (80 / (steps.length - 1)) * index}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 2,
              }}
              onClick={() => setActiveStep(index)}
            >
              {/* Circle */}
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  backgroundColor: stepCompleted[index] ? "#28a745" : activeStep === index ? "#ff7b54" : "#ddd",
                  color: "#fff",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {stepCompleted[index] ? "✓" : index + 1}
              </div>
              {/* Label */}
              <span
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  fontWeight: activeStep === index ? "bold" : "normal",
                  color: activeStep === index ? "#333" : "#888",
                  whiteSpace: "nowrap",
                }}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </header>

      <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {activeStep === 0 && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Branch</h1>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={branch.image}
                    alt={branch.name}
                    style={{ width: "60px", height: "60px", borderRadius: "50%", marginBottom: "10px" }}
                  />
                  <h3 style={{ fontSize: "18px", margin: "0 0 5px" }}>{branch.name}</h3>
                  <p style={{ fontSize: "14px", margin: "0 0 10px", color: "#888" }}>{branch.type}</p>
                  <p style={{ fontSize: "12px", margin: "0 0 10px", color: "#888" }}>{branch.location}</p>
                  <button
                    style={{
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 15px",
                      cursor: "pointer",
                    }}
                    onClick={handleCompleteStep}
                  >
                    Select
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        {activeStep === 1 && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Date & Time</h1>
            <p style={{ marginBottom: "10px", color: "#555" }}>
              Available slots are marked in <span style={{ color: "#28a745" }}>green</span>. Booked slots are marked in <span style={{ color: "#dc3545" }}>red</span>.
            </p>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", marginBottom: "20px" }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <div key={index} style={{ textAlign: "center", fontWeight: "bold", color: "#555" }}>{day}</div>
              ))}
            </section>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
              {Array.from({ length: 28 }, (_, index) => {
                const isAvailable = timeSlots[index % timeSlots.length]?.available;
                const slotTime = timeSlots[index % timeSlots.length]?.time;
                return (
                  <button
                    key={index}
                    style={{
                      backgroundColor: isAvailable ? "#28a745" : "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 0",
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      opacity: isAvailable ? 1 : 0.7,
                    }}
                    onClick={() => {
                      if (isAvailable) {
                        handleCompleteStep();
                        alert(`Selected time slot: ${slotTime}`);
                      }
                    }}
                    disabled={!isAvailable}
                  >
                    {slotTime || ""}
                  </button>
                );
              })}
            </section>
          </>
        )}

        {activeStep === 2 && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Staff</h1>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={employee.image}
                    alt={employee.name}
                    style={{ width: "60px", height: "60px", borderRadius: "50%", marginBottom: "10px" }}
                  />
                  <h3 style={{ fontSize: "18px", margin: "0 0 5px" }}>{employee.name}</h3>
                  <p style={{ fontSize: "14px", margin: "0 0 10px", color: "#888" }}>{employee.role}</p>
                  <button
                    style={{
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 15px",
                      cursor: "pointer",
                    }}
                    onClick={handleCompleteStep}
                  >
                    Select
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        {activeStep === 3 && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Complete Booking</h1>
            <form>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="phone" style={{ display: "block", fontSize: "14px", color: "#555" }}>Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="promo" style={{ display: "block", fontSize: "14px", color: "#555" }}>Promo Code</label>
                <input
                  id="promo"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 15px",
                    cursor: "pointer",
                  }}
                >
                  Apply Promo Code
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => handleNavigation("prev")}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 15px",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigation("next")}
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 15px",
                    cursor: "pointer",
                  }}
                >
                  Complete Booking
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default BookingPage;
