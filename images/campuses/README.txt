CAMPUS PHOTOS
=============

Add one photo per campus here, named exactly like this:

  campus-1.jpg   (Main Campus — photo already lives in images/opt/campus-sm.jpg)
  campus-2.jpg
  campus-3.jpg
  campus-4.jpg
  campus-5.jpg

Suggested size: 900 x 620 px (landscape). JPG or PNG both work.

AFTER ADDING A PHOTO
--------------------
Open js/main.js and find the `branchData` list (search for "branchData").
For the campus you added a photo for, set its `image` field, for example:

    {
      id: 'campus-2',
      name: 'Campus 2',
      image: 'images/campuses/campus-2.jpg',   // <-- add this line
      location: '...',
      curriculum: '...',
      classes: '...'
    }

The card and the detail pop-up will show the photo automatically.
If the image field is empty, a neutral placeholder is shown instead.

If a campus needs its own phone/email, add them too:

    phone: '+91 98765 43210',
    email: 'campus2@happykidshs.edu.in'

(Leave these out and the contact section will show the central office details.)
