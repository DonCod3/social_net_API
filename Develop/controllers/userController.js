const { User, Thoughts } = require('../models');

// get user count aggregate function
const userCount = async () => {
    const numberOfUsers = await User.aggregate()
    .count('userCount');
    return numberOfUsers;
}

// get friend count aggregate function
const friendCount = async (getUserById) => 
    User.aggregate([
        { $match: { _id: new ObjectId (getUserById) } },
        {
            $unwind: '$friends',
        },
        {
            $group: {
                _id: new ObjectId (getUserById),
                friendCount: { $sum: 1 },
            },
        },
    ]);

module.exports = {
    // get all users
    async getAllUsers(req, res) {
        try {
            const userData = await User.find({})
                .populate('thoughts')
                .populate('friends');
            res.json(userData);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    },
    // get one user by id
    async getUserById(req, res) {
        try {
            const userData = await User.findOne({ _id: req.params.id })
                .populate('thoughts')
                .populate('friends');
            res.json({userData, friendCount});
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    },
    // create a new user
    async createUser(req, res) {
        try {
            const userData = await User.create(req.body);
            res.json(userData);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    },
    // update user by id
    async updateUser(req, res) {
        try {
            const userData = await User.findOneAndUpdate(
                { _id: req.params.id },
                req.body,
                { new: true }
            );
            res.json(userData);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    },
    // delete user by id
    async deleteUser(req, res) {
        try {
            const userData = await User.findOneAndDelete({ _id: req.params.id });

            if (!userData) {
                res.status(404).json({ message: 'No user found with this id' });
                return;
            }

            // delete associated thoughts
            await Thoughts.deleteMany({ _id: { $in: userData.thoughts } });

        }
        catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    },
    // add friend
    async addFriend(req, res) {
        try {
            const userData = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $addToSet: { friends: req.params.friendId } },
                { new: true }
            );
            if (!userData) {
                res.status(404).json({ message: 'No user found with this id' });
                return;
            }
            res.json(userData);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    },
    // remove friend
    async removeFriend(req, res) {
        try {
            const userData = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $pull: { friends: req.params.friendId } },
                { new: true }
            );
            if (!userData) {
                res.status(404).json({ message: 'No user found with this id' });
                return;
            }
            res.json(userData);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    }
}