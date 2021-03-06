/*
 * Prompt
 * https://github.com/qawemlilo/prompt
 *
 * Copyright (c) 2013 Qawelesizwe
 * Licensed under the MIT license.
 */
 
"use strict";




/*
   Parses a question passed by the module user
   
   @param - question (Object) - a question object with three properties, question, required, and validate
   @returns - Object
*/
function parseQuestion(question) {
    var Q = Object.create({});
    
    if (question.validate) {
        Q.validate = question.validate;
    } else {
        Q.validate = function (answer) {return true;};
    }
    
    if (question.filter) {
        Q.filter = question.filter;
    } else {
        Q.filter = false;
    }
    
    if (question.required) {
        Q.required = true;
    } else {
        Q.required = false;
    }
    
    
    if (question.question) {
        Q.question = question.question;
    } else {
        Q.question = 'undefined';
    }
    
    return Q;
}



module.exports = function (ques, done) {

    var questions = ques.slice(),
        stdin = process.stdin,
        stdout = process.stdout,
        answers = Object.create({});
 
    stdin.setEncoding('utf8');
    
    /*
       Commandline prompt function
       @param - question (String)
       @param - fn (Function) - callback function that accepts an answer     
    */
    function prompt(question, fn) {
        stdin.resume();
        stdout.write(question + ": ");

        stdin.once('data', function(answer) {
            fn(answer.trim());
        });
    }

    
    

    /*
       Recursive function for asking questions. Exits when questions queue is empty
       @param - question (String)
       @param - fn (Function) - callback function that accepts an answer     
    */    
    function ask(repeat) {
        if (!questions.length && !repeat) {
            stdin.end();
            return done(answers);
        }
        
        var question, next, Q;
        
        if (!repeat) {
            question = questions.shift();
            next = parseQuestion(question);
        } else {
            next = repeat;
        }
        
        if (next.error) {
            Q = next.question + ' (' + next.error + ')';
        } else {
            Q = next.question;
        }
    
        prompt(Q, function (answer) {
           
            if (next.required && !answer) {
            
                //clone original question
                var og = JSON.parse(JSON.stringify(next));
                
                next.og = og;
                next.error = 'required';
                
                return ask(next);
            }
            else if (!next.validate.call(undefined, answer)) {

                //clone original question
                var og = JSON.parse(JSON.stringify(next));
                
                next.og = og;
                next.error = 'invalid';
                
                return ask(next);
            }
            else {
                if (next.filter) {
                    answer = next.filter.call(undefined, answer);
                }
                
                if (repeat) {
                    answers[next.og.question] = answer;
                } 
                else {
                    answers[next.question] = answer;
                }
                
                ask();
            }
        });
    }
    
    
    ask();
};

module.exports.parseQuestion = parseQuestion;