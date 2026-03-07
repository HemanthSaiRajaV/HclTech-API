const router = require('express').Router();
const Employee = require('../models/Employee');

// POST /api/employees — Create new employee
router.post('/', async (req, res) => {
  try {
    const { name, email, department } = req.body;

    // Basic validation
    if (!name || !email || !department)
      return res.status(400).json({ error: 'name, email, department are required' });

    const employee = new Employee({ name, email, department });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    // Duplicate email throws code 11000
    if (err.code === 11000)
      return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees — Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 }); // sorted A-Z
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id — Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
