/**
 * Onboarding slide data for Finovo.
 *
 * Each slide is self-describing:
 *  - `header`      : 'logo-skip' | 'back-title'
 *  - `illustration`: { type: 'icon', name } | { type: 'image', source }
 *  - `cta`         : 'arrow-button' | 'get-started'
 *
 * Slide content lives here. Screen logic + styles are untouched when adding slides.
 */
const ONBOARDING_SLIDES = [
    {
        id: '1',
        title: 'Track Your Spending',
        subtitle:
            'Log your daily expenses in seconds and stay on top of your financial goals effortlessly.',
        header: 'logo-skip',
        illustration: { 
            type: 'image', 
            source: require('../../assets/images/image.png') 
        },
        cta: 'arrow-button',
    },
    {
        id: '2',
        title: 'Save Smarter',
        subtitle:
            'Gain insights into your habits and grow your wealth effortlessly.',
        header: 'back-title',
        illustration: { 
            type: 'image', 
            source: require('../../assets/images/pexels-cottonbro-3943723.jpg') 
        },
        cta: 'arrow-button',
    },
    {
        id: '3',
        title: 'Reach Your Goals',
        subtitle:
            'Visualize your savings progress and build healthy financial habits every day.',
        header: 'back-title',
        illustration: { 
            type: 'image', 
            source: require('../../assets/images/pexels-towfiqu-barbhuiya-3440682-9755390.jpg') 
        },
        cta: 'get-started',
    },
];

export default ONBOARDING_SLIDES;
