# WebVR Chandra tours

A collection of browser-based VR tours depicting outer-space bodies, with an emphasis on data collected from the Chandra X-ray Observatory.

## Contents

* VR tours for:
	* Crab Nebula
	* Tycho's Supernova
	* SN 1006
	* IC 443
* Gallery page (gallery.html) linking to all the tours
* Models, textures, and A-frame components required to display the VR data

## Technical summary

Each "tour" is an html file located in its own subdirectory of /Tours. The tours make use of the A-frame WebVR framework.

Almost every model's material is modified to varying degrees with a custom A-frame component - see each tour's html file to view the specific components used. Overriding the default materials allows us to modify the model materials with custom shaders, as well as make use of all the material options available in three.js (which A-frame makes use of.)

The execution of the tours (moving through stops, displaying text, etc) is largely handled in the controller.js component.