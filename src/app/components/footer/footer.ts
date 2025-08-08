import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  contactInfo = {
    name: 'ExamMate',
    address: 'P.O.Box 100,',
    phones: [
      { label: '+233 (0)', link: 'tel:+233244781199' }
    ],
    emails: [
      { label: 'exammate@gmail.com', link: 'mailto:exammate@gmail.com' }
    ]
  };

  menuItems = [
    { label: 'Home', link: '/' },
    { label: 'About', link: '/about' },
  ];

  socials = [
    { icon: 'assets/svg/telephone.svg', alt: 'telephone', link: 'tel:+233' },
    { icon: 'assets/svg/whatsapp.svg', alt: 'whatsapp', link: 'https://wa.me/+233' }
  ];

  currentYear: number = new Date().getFullYear();
}
