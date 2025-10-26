/**
 * MySQL to JSON Export Script for Workouts & Exercises
 * 
 * This script exports your workout catalog from MySQL to JSON files
 * Run: node scripts/export-workouts-from-mysql.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// ============================================
// CONFIGURATION - Update these with your old database credentials
// ============================================
const DB_CONFIG = {
  host: 'YOUR_AWS_RDS_ENDPOINT',     // e.g., 'lifeset-db.123456.us-east-1.rds.amazonaws.com'
  user: 'YOUR_DB_USERNAME',           // e.g., 'admin'
  password: 'YOUR_DB_PASSWORD',       // Your database password
  database: 'YOUR_DB_NAME',           // e.g., 'lifeset_production'
  port: 3306,
};

// Output file paths
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const WORKOUTS_FILE = path.join(OUTPUT_DIR, 'workouts.json');
const EXERCISES_FILE = path.join(OUTPUT_DIR, 'exercises.json');

// ============================================
// MAIN EXPORT FUNCTION
// ============================================
async function exportWorkoutsFromMySQL() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL!\n');

    // ============================================
    // 1. Export Exercises
    // ============================================
    console.log('📦 Exporting exercises...');
    const [exercises] = await connection.execute(`
      SELECT 
        id,
        name,
        description,
        category,
        difficulty,
        muscle_group,
        equipment,
        video_url,
        thumbnail_url,
        instructions,
        created_at,
        updated_at
      FROM exercises
      ORDER BY category, name
    `);
    
    console.log(`   Found ${exercises.length} exercises`);

    // ============================================
    // 2. Export Workout Plans
    // ============================================
    console.log('📦 Exporting workout plans...');
    const [workoutPlans] = await connection.execute(`
      SELECT 
        id,
        name,
        description,
        difficulty,
        duration_minutes,
        category,
        created_at,
        updated_at
      FROM workout_plans
      ORDER BY category, difficulty, name
    `);
    
    console.log(`   Found ${workoutPlans.length} workout plans`);

    // ============================================
    // 3. Export Workout Plan Exercises (join table)
    // ============================================
    console.log('📦 Exporting workout plan exercises...');
    const [workoutPlanExercises] = await connection.execute(`
      SELECT 
        workout_plan_id,
        exercise_id,
        day_number,
        set_number,
        reps,
        duration_seconds,
        rest_seconds,
        notes,
        order_index
      FROM workout_plan_exercises
      ORDER BY workout_plan_id, day_number, order_index
    `);
    
    console.log(`   Found ${workoutPlanExercises.length} workout-exercise relationships\n`);

    // ============================================
    // 4. Build JSON Structure
    // ============================================
    console.log('🔨 Building JSON structure...');
    
    // Build exercises lookup
    const exercisesById = {};
    exercises.forEach(ex => {
      exercisesById[ex.id] = {
        id: ex.id.toString(),
        name: ex.name,
        description: ex.description,
        category: ex.category,
        difficulty: ex.difficulty,
        muscleGroup: ex.muscle_group,
        equipment: ex.equipment,
        videoUrl: ex.video_url,
        thumbnailUrl: ex.thumbnail_url,
        instructions: ex.instructions ? ex.instructions.split('\n') : [],
      };
    });

    // Build workout plans with exercises
    const workoutsWithExercises = workoutPlans.map(plan => {
      // Get exercises for this plan
      const planExercises = workoutPlanExercises
        .filter(wpe => wpe.workout_plan_id === plan.id)
        .map(wpe => ({
          exerciseId: wpe.exercise_id.toString(),
          exercise: exercisesById[wpe.exercise_id],
          day: wpe.day_number,
          sets: wpe.set_number,
          reps: wpe.reps,
          duration: wpe.duration_seconds,
          rest: wpe.rest_seconds,
          notes: wpe.notes,
          order: wpe.order_index,
        }))
        .sort((a, b) => a.order - b.order);

      // Group exercises by day
      const exercisesByDay = {};
      planExercises.forEach(ex => {
        const day = ex.day || 1;
        if (!exercisesByDay[day]) {
          exercisesByDay[day] = [];
        }
        exercisesByDay[day].push(ex);
      });

      return {
        id: plan.id.toString(),
        name: plan.name,
        description: plan.description,
        difficulty: plan.difficulty,
        duration: plan.duration_minutes,
        category: plan.category,
        days: exercisesByDay,
        totalExercises: planExercises.length,
      };
    });

    // ============================================
    // 5. Save to JSON Files
    // ============================================
    console.log('💾 Saving to JSON files...');
    
    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Save exercises.json
    const exercisesJSON = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalExercises: exercises.length,
      exercises: Object.values(exercisesById),
    };
    await fs.writeFile(EXERCISES_FILE, JSON.stringify(exercisesJSON, null, 2));
    console.log(`   ✅ Saved ${exercises.length} exercises to: ${EXERCISES_FILE}`);

    // Save workouts.json
    const workoutsJSON = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalWorkouts: workoutPlans.length,
      workouts: workoutsWithExercises,
    };
    await fs.writeFile(WORKOUTS_FILE, JSON.stringify(workoutsJSON, null, 2));
    console.log(`   ✅ Saved ${workoutPlans.length} workouts to: ${WORKOUTS_FILE}`);

    // ============================================
    // 6. Summary
    // ============================================
    console.log('\n✨ Export Complete!\n');
    console.log('Summary:');
    console.log(`   📋 Exercises: ${exercises.length}`);
    console.log(`   💪 Workout Plans: ${workoutPlans.length}`);
    console.log(`   🔗 Exercise-Plan Links: ${workoutPlanExercises.length}`);
    console.log(`\nFiles created:`);
    console.log(`   📄 ${EXERCISES_FILE}`);
    console.log(`   📄 ${WORKOUTS_FILE}`);
    console.log(`\n✅ Ready to use in your React Native app!`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check your database credentials in DB_CONFIG');
    console.error('2. Ensure MySQL database is accessible');
    console.error('3. Verify table names match your schema');
    console.error('4. Install mysql2: npm install mysql2');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// ============================================
// RUN EXPORT
// ============================================
console.log('🚀 Starting MySQL to JSON export...\n');
exportWorkoutsFromMySQL();


