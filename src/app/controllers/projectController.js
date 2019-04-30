const authMiddleware = require('../middlewares/auth');
const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const Task = require('../models/task');


router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate(['user', 'tasks']);
        return res.status(200).send({ projects });

    } catch (err) {
        return res.status(400).send({ error: "Erro ao carregar projetos" })
    }
});

router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);
        return res.status(200).send({ project });

    } catch (err) {
        return res.status(400).send({ error: "Erro ao carregar projeto" })
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.create({ title, description, user: req.userId });
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project.id });
            projectTask.save();
            project.tasks.push(projectTask);
        }));

        await project.save();
        return res.send({ project });

    } catch (err) {
        return res.status(400).send({ error: "Erro em criar novo projeto" });
    }
});

router.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId, {
            title,
            description,
        }, { new: true });

        project.tasks = [];
        await Task.remove({ project: project.id })
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project.id });
            projectTask.save();
            project.tasks.push(projectTask);
        }));

        await project.save();
        return res.send({ project });

    } catch (err) {
        return res.status(400).send({ error: "Erro em atualizar projeto" });
    }
});

router.delete('/:projectId', async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId);
        return res.send();

    } catch (err) {
        return res.status(400).send({ error: "Erro ao deletar projeto" })
    }
});

module.exports = app => app.use('/projects', router);