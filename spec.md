# Website Specification



## Overview 

## Sitemap

`/index/<user-id>`

Should accept an argument of user-id from wherever we have recruited users from. Ids should be assigned trials (Euclidean, spherical, or hyperbolic) and be automatically taken to that 'homepage'. For development, let's just have three buttons to move to each.

`/[GEOMETRY]/homepage`

A webpage with an explanation and sample GEOMETRY graph to introduce to the GEOMETRY study participants. Should contain a 'start trial' button to begin the study. 

`/[GEOMETRY]/survey/<graph-id+question>`

Reads the file with the corresponding graph id and question, and passes the required data to the client to 
- draw the graph 
- display the question 
- highlight any necessary nodes

Questions should appear on the left sidebar with answers as either 
- radio buttons (for 'which of the following' questions)
- Free text input (for 'number' questions); In these cases we should try to ensure the answer is valid

The template needs a submit button that cannot be pressed until an (valid) answer has been given. On submit, the answer should be recorded securely. 

## Tracking 

The survey pages must track 
- answers to questions
- time spent on page
- number of times each interaction is used (panning, dblclick, etc.)
- 

## Euclidean requirements

## Spherical requirements

## Hyperbolic requirements

## Storage