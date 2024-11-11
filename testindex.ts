// Import required libraries
import { Moeut } from 'moeut';
import anime from 'animejs';

// Initialize Moeut for content generation
const moeut = new Moeut({
    model: 'gpt2',  // You can change this to other supported models
    temperature: 0.7
});

// Create animation controller
const animationController = {
    fadeIn: (element) => {
        anime({
            targets: element,
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeInOutQuad'
        });
    },
    
    fadeOut: (element) => {
        anime({
            targets: element,
            opacity: [1, 0],
            duration: 1000,
            easing: 'easeInOutQuad'
        });
    },
    
    typeWriter: (element, text) => {
        anime({
            targets: element,
            innerHTML: [0, text.length],
            round: 1,
            easing: 'linear',
            duration: text.length * 50,
            update: function(anim) {
                element.innerHTML = text.substring(0, Math.round(anim.animations[0].currentValue));
            }
        });
    }
};

// Function to generate and animate content
async function generateContent(prompt, targetElement) {
    // Generate content using Moeut
    const generatedText = await moeut.generate(prompt, {
        maxLength: 100,
        numSamples: 1
    });

    // Fade out existing content if any
    if (targetElement.innerHTML) {
        await animationController.fadeOut(targetElement);
        targetElement.innerHTML = '';
    }

    // Show new content with typewriter effect
    animationController.fadeIn(targetElement);
    animationController.typeWriter(targetElement, generatedText);
}
