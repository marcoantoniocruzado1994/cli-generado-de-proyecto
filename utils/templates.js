const ejs= require('ejs');


module.exports={
    render: function (contents,data) {
        return ejs.render(contents,data)
    }
}