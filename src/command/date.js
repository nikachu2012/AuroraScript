setTimeout(() => {
    // date関数
    addCommand({
        code: 'Date.year',
        formula: 'new Date().getFullYear();'
    })

    addCommand({
        code: 'Date.month',
        formula: 'new Date().getMonth();'
    })

    addCommand({
        code: 'Date.date',
        formula: 'new Date().getDate();'
    })

    addCommand({
        code: 'Date.day',
        formula: 'new Date().getDay();'
    })

    addCommand({
        code: 'Date.hours',
        formula: 'new Date().getHours();'
    })

    addCommand({
        code: 'Date.minutes',
        formula: 'new Date().getMinutes();'
    })

    addCommand({
        code: 'Date.seconds',
        formula: 'new Date().getSeconds();'
    })

    addCommand({
        code: 'Date.seconds',
        formula: 'new Date().getMilliseconds();'
    })
}, 10);

