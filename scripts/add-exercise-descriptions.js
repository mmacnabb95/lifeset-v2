const fs = require('fs');
const path = require('path');

// Load exercises.json
const exercisesPath = path.join(__dirname, '../src/data/exercises.json');
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));

// Function to generate a description based on exercise name and category
function generateDescription(name, category) {
  const nameWithoutNumbers = name.replace(/^\d+\s*/, '').trim();
  
  // Common exercise descriptions based on patterns
  const descriptions = {
    // Abs
    'Air Twisting Crunch': 'Lie on your back and perform crunches while twisting your torso, bringing opposite elbow to knee. Great for obliques and core stability.',
    'Alternate Heel Touchers': 'Lie on your back with knees bent, reach side to side touching your heels. Targets obliques and upper abs.',
    'Bicycle Crunch': 'Lie on your back and perform a pedaling motion while bringing opposite elbow to knee. Excellent full ab workout.',
    'Crunches': 'Classic abdominal exercise. Lie on your back, knees bent, and lift your shoulders off the ground by contracting your abs.',
    'Plank': 'Hold a push-up position with forearms on the ground. Keep your body in a straight line. Core stability exercise.',
    'Side Plank': 'Balance on one forearm with your body in a straight line sideways. Targets obliques and core stability.',
    'Leg Raises': 'Lie on your back and raise your legs up and down while keeping them straight. Targets lower abs.',
    'Mountain Climbers': 'From a plank position, alternate bringing knees to chest in a running motion. Full core and cardio exercise.',
    
    // Chest
    'Push Ups': 'Classic upper body exercise. Lower your chest to the ground and push back up. Works chest, shoulders, and triceps.',
    'Wide Arm Push Ups': 'Push-ups with hands placed wider than shoulder-width. Emphasizes chest muscles.',
    'Diamond Push Ups': 'Push-ups with hands close together forming a diamond shape. Targets triceps and inner chest.',
    'Decline Push Ups': 'Push-ups with feet elevated. Increases difficulty and emphasizes upper chest.',
    'Incline Push Ups': 'Push-ups with hands elevated on a bench. Easier variation that still builds chest strength.',
    
    // Back
    'Pull Ups': 'Hang from a bar and pull yourself up until chin is over the bar. Premier back and bicep exercise.',
    'Chin Ups': 'Like pull-ups but with palms facing you. Emphasizes biceps more than standard pull-ups.',
    'Superman': 'Lie face down and simultaneously lift arms and legs off the ground. Strengthens lower back and glutes.',
    'Bent Over Row': 'Hinge at hips with weights, pull them to your torso. Builds back thickness and strength.',
    
    // Legs
    'Squats': 'Stand with feet shoulder-width apart, lower your body as if sitting back into a chair. Return to standing. King of leg exercises.',
    'Lunges': 'Step forward and lower your back knee toward the ground. Alternate legs. Great for quads and glutes.',
    'Bulgarian Split Squat': 'Rear foot elevated on bench, lower into a lunge. Targets quads and glutes intensely.',
    'Jump Squats': 'Perform a squat then explode upward into a jump. Builds explosive power.',
    'Calf Raises': 'Stand on toes and lower back down. Can be done on a step for greater range. Builds calf muscles.',
    'Glute Bridge': 'Lie on back, knees bent, lift hips toward ceiling. Excellent glute activation exercise.',
    'Single Leg Glute Bridge': 'Glute bridge performed with one leg extended. More challenging glute exercise.',
    
    // Shoulders
    'Shoulder Press': 'Press weights overhead from shoulder height. Primary shoulder builder.',
    'Lateral Raises': 'Raise weights out to sides until parallel with ground. Targets side deltoids.',
    'Front Raises': 'Raise weights in front of body to shoulder height. Works front deltoids.',
    'Arnold Press': 'Rotate palms while pressing weights overhead. Works all three deltoid heads.',
    'Pike Push Ups': 'Push-ups with hips raised high in an inverted V position. Bodyweight shoulder exercise.',
    
    // Arms - Biceps
    'Bicep Curls': 'Curl weights up toward shoulders, keeping elbows stationary. Classic bicep builder.',
    'Hammer Curls': 'Curl weights with neutral grip (palms facing each other). Targets brachialis and forearms.',
    'Concentration Curls': 'Seated, rest elbow on inner thigh and curl weight up. Isolated bicep exercise.',
    
    // Arms - Triceps
    'Tricep Dips': 'Support body on parallel bars or bench, lower and raise body by bending elbows. Targets triceps.',
    'Overhead Tricep Extension': 'Hold weight overhead with both hands, lower behind head and extend. Hits long head of triceps.',
    'Tricep Kickbacks': 'Hinge forward, extend arm straight back. Isolates triceps.',
    'Close Grip Push Ups': 'Push-ups with hands close together. Emphasizes triceps over chest.',
  };
  
  // Check for exact matches first
  if (descriptions[nameWithoutNumbers]) {
    return descriptions[nameWithoutNumbers];
  }
  
  // Check for partial matches (e.g., "45 Side Bend" matches "Side Bend")
  for (const [key, desc] of Object.entries(descriptions)) {
    if (nameWithoutNumbers.includes(key) || key.includes(nameWithoutNumbers)) {
      return desc;
    }
  }
  
  // Generate generic description based on category and exercise type
  const categoryDescriptions = {
    abs: `Perform this exercise to strengthen your core and abdominal muscles. Focus on controlled movements and proper form.`,
    chest: `A chest exercise that builds upper body strength. Keep your core engaged and maintain proper alignment throughout.`,
    back: `Strengthens your back muscles and improves posture. Focus on squeezing shoulder blades together at the peak.`,
    legs: `Lower body exercise targeting legs and glutes. Maintain balance and control throughout the movement.`,
    shoulders: `Builds shoulder strength and stability. Keep core tight and avoid using momentum.`,
    arms: `Targets arm muscles for strength and definition. Control the weight throughout the entire range of motion.`,
    biceps: `Isolates bicep muscles for arm development. Avoid swinging and keep elbows stable.`,
    triceps: `Builds the back of the upper arm. Focus on the squeeze at full extension.`,
    cardio: `Cardiovascular exercise to boost heart rate and burn calories. Maintain intensity throughout.`,
    stretching: `Flexibility and mobility exercise. Hold stretches for 20-30 seconds and breathe deeply.`,
    glutes: `Targets glute muscles for lower body strength. Focus on squeezing at the top of the movement.`,
  };
  
  return categoryDescriptions[category] || `Perform this ${category} exercise with proper form and controlled movements. Follow the video for correct technique.`;
}

// Update all exercises with better descriptions
const updatedExercises = exercises.map(exercise => ({
  ...exercise,
  description: generateDescription(exercise.name, exercise.category)
}));

// Write back to file
fs.writeFileSync(
  exercisesPath,
  JSON.stringify(updatedExercises, null, 2),
  'utf-8'
);

console.log(`✅ Updated ${updatedExercises.length} exercise descriptions`);
console.log('Sample updated exercises:');
updatedExercises.slice(0, 5).forEach(ex => {
  console.log(`  - ${ex.name}: "${ex.description.substring(0, 60)}..."`);
});

