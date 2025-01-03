import React, { useState } from "react";
import Navbar from '../components/Navbar';

const BookingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState([false, false, false, false]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const steps = ["Branch", "Date & Time", "Staff", "Complete Booking"];

  const branches = [
    { id: 1, name: "SnapHarvest Cbd", type: "photostudio", location: "Cbd", image: "https://via.placeholder.com/60" },
    { id: 2, name: "SnapHarvest Lavington", type: "photostudio", location: "Lavington", image: "https://via.placeholder.com/60" },
    { id: 3, name: "SnapHarvest Karen", type: "photostudio", location: "Karen", image: "https://via.placeholder.com/60" },
    { id: 4, name: "SnapHarvest kilimani", type: "photostudio", location: "kilimani", image: "https://via.placeholder.com/60" },
  ];

  const employees = [
    { id: 1, name: "Salvato", email: "alinaskazka@gmail.com", date1: "Nov 20, 2023", date2: "Nov 21, 2023", status: true },
    { id: 2, name: "Dylen Grace", email: "dylengrace05@gmail.com", date1: "Nov 20, 2023", date2: "Nov 21, 2023", status: true },
    { id: 3, name: "Merva Sahin", email: "merva_sahin@gmail.com", date1: "Nov 20, 2023", date2: "Nov 21, 2023", status: true },
    { id: 4, name: "Carsten Kohler", email: "carstenkohler@gmail.com", date1: "Nov 20, 2023", date2: "Nov 21, 2023", status: false },
    { id: 5, name: "Alex Foster", email: "alexfoster_88@gmail.com", date1: "Nov 20, 2023", date2: "Nov 21, 2023", status: true },
    { id: 6, name: "John Miller", email: "johnmiller@gmail.com", date1: "Nov 20, 2023", date2: "Nov 21, 2023", status: true },
    { id: 7, name: "Tammy Collier", email: "tammycollier@gmail.com", date1: "Nov 20, 2023", date2: "Nov 21, 2023", status: false },
    { id: 8, name: "Madison Inouye", email: "madisoninouye@gmail.com", date1: "Nov 20, 2023", date2: "Nov 21, 2023", status: true },
  ];

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
                  <div style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "50%",
                    marginBottom: "10px",
                  }}></div>
                  <h3 style={{ fontSize: "18px", margin: "0 0 5px" }}>{employee.name}</h3>
                  <p style={{ fontSize: "14px", margin: "0 0 10px", color: "#888" }}>{employee.email}</p>
                  <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                    <p style={{ margin: 0 }}>{employee.date1}</p>
                    <p style={{ margin: 0 }}>{employee.date2}</p>
                  </div>
                  <button
                    style={{
                      backgroundColor: employee.status ? "#28a745" : "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 15px",
                      cursor: "pointer",
                    }}
                    disabled={!employee.status}
                    onClick={handleCompleteStep} // Complete the step on select
                  >
                    {employee.status ? "Select" : "Unavailable"}
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        {activeStep === 3 && (
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1, backgroundColor: "#f0f0f0", padding: "20px", borderRadius: "8px" }}>
              <h2 style={{ marginBottom: "20px" }}>Booking Summary</h2>
              <p>Selected Branch: Snapharvest Karen</p>
              <p>Date & Time: Nov 20, 2023 - 08:00 am</p>
              <p>Staff: Salvato</p>
              <p style={{ marginTop: "20px", color: "#888" }}>
                To complete booking you are required to pay this small coupon/booking fee for we negotiate these prices for you to ensure you save a lot.
              </p>
              <div style={{ marginTop: "20px" }}>
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ padding: "10px", width: "70%", marginRight: "10px" }}
                />
                <button
                  onClick={handleApplyPromoCode}
                  style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "8px" }}
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p style={{ color: "#28a745", marginTop: "10px" }}>Promo code applied! You have received a discount.</p>
              )}
            </div>

            <div style={{ flex: 1, backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
              <h2 style={{ marginBottom: "20px" }}>Payment Options</h2>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={selectedPaymentMethod === 'card'}
                    onChange={() => setSelectedPaymentMethod('card')}
                  />
                  Pay with Card
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mpesa"
                    checked={selectedPaymentMethod === 'mpesa'}
                    onChange={() => setSelectedPaymentMethod('mpesa')}
                  />
                  Pay with M-Pesa
                </label>
              </div>

              {selectedPaymentMethod === 'card' && (
                <form>
                  <input
                    type="email"
                    placeholder="Email"
                    style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
                  />
                  <input
                    type="text"
                    placeholder="Card Number"
                    style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
                  />
                  <input
                    type="text"
                    placeholder="MM/YY"
                    style={{ display: "inline-block", width: "48%", marginRight: "4%", padding: "10px" }}
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    style={{ display: "inline-block", width: "48%", padding: "10px" }}
                  />
                  <button
                    style={{ marginTop: "20px", backgroundColor: "#28a745", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px" }}
                  >
                    Complete Booking
                  </button>
                </form>
              )}

              {selectedPaymentMethod === 'mpesa' && (
                <div>
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    

                    style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
                  />
                  <button
                    style={{ marginTop: "20px", backgroundColor: "#28a745", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px" }}
                  >
                    Complete Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer style={{ display: "flex", justifyContent: "space-between", padding: "20px", maxWidth: "800px", margin: "20px auto" }}>
        <button
          onClick={() => handleNavigation("prev")}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: activeStep > 0 ? "pointer" : "not-allowed",
            opacity: activeStep > 0 ? 1 : 0.5,
          }}
          disabled={activeStep === 0}
        >
          Previous
        </button>
        <button
          onClick={() => handleNavigation("next")}
          style={{
            background: "#ff7b54",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: stepCompleted[activeStep] ? "pointer" : "not-allowed",
            opacity: stepCompleted[activeStep] ? 1 : 0.5,
          }}
          disabled={!stepCompleted[activeStep]}
        >
          Next
        </button>
      </footer>
    </div>
  );
};

export default BookingPage;
