
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
// TODO: Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
emailjs.init("1dVQKiTXtKs8xkvA-");

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    const successPopup = document.getElementById('success-popup');
    const closePopupBtn = document.getElementById('close-popup');

    // Close Popup Logic
    if (closePopupBtn && successPopup) {
        closePopupBtn.addEventListener('click', () => {
            successPopup.classList.add('hidden');
        });

        // Close on outside click
        successPopup.addEventListener('click', (e) => {
            if (e.target === successPopup) {
                successPopup.classList.add('hidden');
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // TODO: Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID'
            const serviceID = 'service_ix7ef8b';
            const templateID = 'template_s6r9woq';

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    // Show Popup
                    if (successPopup) {
                        successPopup.classList.remove('hidden');
                    } else {
                        alert('Message sent successfully!');
                    }

                    contactForm.reset();
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }, (err) => {
                    alert('Failed to send message. Please try again later.');
                    console.error('EmailJS Error:', err);
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});
