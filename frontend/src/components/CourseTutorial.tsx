import { useEffect } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export default function CourseTutorial() {
  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md rounded-lg',
        scrollTo: true,
        cancelIcon: {
          enabled: true
        }
      }
    });

    tour.addStep({
      
      id: 'welcome',
      text: 'Welcome to ScholarLog! Let\'s take a quick tour of the courses page.',
      attachTo: {
        element: '.tabs-list',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip',
          action: tour.cancel
        },
        {
          text: 'Next',
          action: tour.next
        }
      ]
    });

    tour.addStep({
      id: 'active-completed',
      text: 'Here you can switch between your active and completed courses.',
      attachTo: {
        element: '.tabs-list',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ]
    });

    tour.addStep({
      id: 'add-course',
      text: 'Click here to add a new course to your list.',
      attachTo: {
        element: '.add-course-button',
        on: 'left'
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ]
    });

    tour.addStep({
      id: 'course-card',
      text: 'Click on any active course card to view its details and manage assignments.',
      attachTo: {
        element: '.course-card',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ]
    });

    tour.addStep({
      id: 'course-actions',
      text: 'Use these buttons to edit or delete a course.',
      attachTo: {
        element: '.course-actions',
        on: 'left'
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Finish',
          action: tour.complete
        }
      ]
    });

    // Start the tour
    tour.start();

    // Cleanup
    return () => {
      tour.complete();
    };
  }, []);

  return null;
} 