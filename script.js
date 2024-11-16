const foodRequiredRadios = document.getElementsByName('food_required');
const foodDetails = document.getElementById('foodDetails');

foodRequiredRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'Yes') {
            foodDetails.style.display = 'block';
        } else {
            foodDetails.style.display = 'none';
        }
    });
});

document.getElementById('registrationForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    const response = await fetch('http://localhost:3000/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result = await response.text();
    alert(result);
});
