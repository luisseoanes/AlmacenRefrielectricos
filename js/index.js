// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = 120;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// WhatsApp Obfuscation
function openSafeWhatsapp() {
    // Number split to avoid simple scrapers
    const p1 = "57";
    const p2 = "304";
    const p3 = "670";
    const p4 = "2677";
    const msg = "Hola! Vengo desde la página web y necesito información.";
    const url = `https://wa.me/${p1}${p2}${p3}${p4}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

// Expose to global scope for HTML onclick
window.openSafeWhatsapp = openSafeWhatsapp;