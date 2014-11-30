/**
 * Append test
 */
QUnit.test('append test', function(assert) {
    $('#append-div').append('img', {"src" : "img/image1.jpg", "id" : "test-image", "alt" : "Hello this is an image."})
        .append('div', {"class" : "test-div"}, '<h4>Hello</h4><p>This is some inner HTML. Woo hoo!</p>')
        .append('br')
        .appendInput({"type" : "text", "name" : "first_name", "id" : "first_name", "size" : "30", "value" : "Bubba", "style" : "background-color: #d3dfb5; border: solid 1px #000; float: right;"})
        .append('br')
        .appendCheckbox([['color1', 'Red'], 'White', 'Blue'], {"name" : "colors[]", "id" : "colors", "class" : "checkBox", "style" : "border: solid 4px #000;"}, ['Red', 'Blue'])
        .append('br')
        .appendRadio(['12', '14', ['number3', '16']], {"name" : "nums", "id" : "nums", "class" : "radioBtn", "style" : "color: #ff0000;"}, '16')
        .append('br')
        .appendSelect([['color4', 'Purple'], 'Green', 'Gold'], {"name" : "more_colors[]", "id" : "more_colors", "multiple" : "multiple", "style" : "background-color: #d3dfb5; border: solid 1px #000; float: right;"}, ['Green', 'Gold'])
        .append('br')
        .appendSelect('MONTHS_SHORT', {"name" : "months", "id" : "months"})
        .append('br')
        .appendTextarea({"name" : "some_text", "id" : "some_text", "rows" : "5", "cols" : "50", "style" : "background-color: #D3DFB5; border: solid 1px #000;"}, '<h1>Hello World!</h1><p>I said, "Hello World" didn\'t I.</p>')
        .append('br')
        .append('br');

    assert.equal($('#test-image').attrib('alt'), 'Hello this is an image.');
    assert.equal($('#first_name').val(), 'Bubba');
    assert.notEqual($('#colors')[0], undefined);
    assert.notEqual($('#nums')[0], undefined);
    assert.notEqual($('#more_colors')[0], undefined);
    assert.notEqual($('#months')[0], undefined);
    assert.notEqual($('#some_text')[0], undefined);

});

QUnit.test('remove test', function(assert) {
    $('#test-image').remove();
    $('#first_name').remove();
    $('div.test-div').val('Testing 1 2 3');
    assert.equal($('#test-image')[0], undefined);
    assert.equal($('#first_name')[0], undefined);
    assert.equal($('div.test-div').val(), 'Testing 1 2 3');
});

QUnit.test('clone test', function(assert) {
    $('#some_select_new_1').clone({'name' : 'some_select_new_2', 'id' : 'some_select_new_2'}, true, true).appendTo('#clone-div');
    assert.notEqual($('#some_select_new_2')[0], undefined);
});

QUnit.test('prepend test', function(assert) {
    $('#prepend-div').prepend('div', {'id' : 'new-div', 'style' : 'width: 300px; height: 50px; background-color: #e2f8ff; border: solid 1px #000;'}, 'New Div!');
    assert.notEqual($('#new-div')[0], undefined);
});


