$(function(){
    $(".boop").dialog({
        autoOpen: false,
        show: {
            effect: "scale",
            easing: 'easeOutBounce',
            duration: 1000
        },
        hide: {
            effect: "scale",
            duration: 300
        }
    });
    $('#newBoop').click(function() {
        $('.boop').dialog('open');
    })
});