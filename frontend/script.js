let latestPrediction = null;

document
  .getElementById("calculatorForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const budget = document.getElementById("inputBudget").value;
    const weeks = document.getElementById("inputWeeks").value;
    const complexity = document.getElementById("inputComplexity").value;
    const submitBtn = this.querySelector("button");
    const originalBtnText = submitBtn.innerHTML;

    // Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Calculando...';

    try {
      // Usar ruta relativa para que funcione tanto en local (vía proxy si se configura) como en producción
      const response = await fetch("/api/predict_viability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, weeks, complexity }),
      });

      if (!response.ok) throw new Error("Error al conectar con el servidor");

      const data = await response.json();
      latestPrediction = data; // Store for later report saving

      // Show Result
      document.getElementById("resultSection").classList.remove("hidden");

      // Update Text
      document.getElementById("scoreValue").innerText = `${data.score}%`;
      document.getElementById("feedbackMessage").innerText = data.message;

      // Animate Circle
      // r=70, circumference approx 440
      const circle = document.getElementById("scoreCircle");
      const offset = 440 - (440 * data.score) / 100;
      circle.style.strokeDashoffset = offset;

      // Color based on score
      if (data.score >= 80) {
        circle.classList.add("text-emerald-500");
        circle.classList.remove("text-indigo-500", "text-rose-500");
        document.getElementById("scoreText").className =
          "text-xs font-bold uppercase text-emerald-400 mt-1";
      } else if (data.score >= 50) {
        circle.classList.add("text-amber-500");
        circle.classList.remove(
          "text-indigo-500",
          "text-emerald-500",
          "text-rose-500",
        );
        document.getElementById("scoreText").className =
          "text-xs font-bold uppercase text-amber-400 mt-1";
      } else {
        circle.classList.add("text-rose-500");
        circle.classList.remove("text-indigo-500", "text-emerald-500");
        document.getElementById("scoreText").className =
          "text-xs font-bold uppercase text-rose-400 mt-1";
      }

      // Scroll to result
      document
        .getElementById("resultSection")
        .scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert("Hubo un error al generar la predicción: " + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!latestPrediction) {
      alert("Primero debes generar una predicción.");
      return;
    }

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const statusText = document.getElementById("saveStatus");
    const submitBtn = this.querySelector("button");

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    statusText.classList.add("hidden");

    try {
      const response = await fetch("/api/save_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          prediction_data: latestPrediction,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al guardar reporte");
      }

      const data = await response.json();

      statusText.innerText = `✅ Reporte guardado: ${data.file}`;
      statusText.className = "text-sm text-center mt-3 text-emerald-400";
      statusText.classList.remove("hidden");

      // Optional: clear form
      this.reset();
    } catch (error) {
      statusText.innerText = `❌ Error: ${error.message}`;
      statusText.className = "text-sm text-center mt-3 text-rose-400";
      statusText.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Reporte';
    }
  });
