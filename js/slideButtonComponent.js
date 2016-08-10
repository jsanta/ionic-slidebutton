/**
 * slideButtonComponent.js
 * Slide button component, used to confirm operations without fear of
 * making any operation "by accident" (Oh! I accidently pressed the submit button).
 * @author Jose Ignacio Santa Cruz G. (j [at] santa dot cl)
 * @date July 2016
 **/
/*global ionic, cordova, console, requestAnimationFrame, cancelAnimationFrame */
(function (angular) {
    'use strict';

    var slideButtonController = function ($scope, $timeout, $ionicSideMenuDelegate, $ionicGesture) {

        // Note of warning: This kind of selector allows only one working slide button per page/view
        // TODO: Find out how to allow multiple slide buttons (not required now)
        var slideBtnCtrl = this,
            domContainer = document.querySelector('.slide-button'),
            container = angular.element(domContainer),
            element   = angular.element(document.querySelector('.slide-button button')),
            btn = element[0],
            row = container[0],
            initDomValues = function () {
                console.log('initDomValues');
                domContainer = document.querySelector('.slide-button');
                container = angular.element(domContainer);
                element   = angular.element(document.querySelector('.slide-button button'));
                btn = element[0];
                row = container[0];
            };

        slideBtnCtrl.showMessage = false;

        slideBtnCtrl.onClick = function (e) {
            slideBtnCtrl.showMessage = true;

            $timeout(function () {
                slideBtnCtrl.showMessage = false;
            }, 7500);
        };

        slideBtnCtrl.onDrag = function (event) {
            if (slideBtnCtrl.manageDrag) {
                $ionicSideMenuDelegate.canDragContent(false);
            }
        };

        slideBtnCtrl.onRelease = function (event) {
            if (slideBtnCtrl.manageDrag) {
                $ionicSideMenuDelegate.canDragContent(true);
            }
        };
        slideBtnCtrl.dragEnabled = false;
        slideBtnCtrl.done        = false;

        var startPos = {
                left: 0,
                top: 0
            },
            posCss = {},
            offsetX = 0,
            slideTolerance = 35,
            done = slideBtnCtrl.done,
            isDragging = false,
            animationRequestObj,
            touchHold = function (e) {
                slideBtnCtrl.showMessage = true;
                if (slideBtnCtrl.manageDrag) {
                    $ionicSideMenuDelegate.canDragContent(false);
                }

                isDragging        = true;
                done              = false;
                slideBtnCtrl.done = done;

                $timeout(function () {
                    slideBtnCtrl.dragEnabled = true;
                    // requires executing: ionic plugin add cordova-plugin-vibration
                    navigator.vibrate(300);

                });

                startPos = {
                    left: (ionic.Platform.isIOS()) ? e.gesture.srcEvent.pageX : e.gesture.srcEvent.touches[0].pageX,
                    top : (ionic.Platform.isIOS()) ? e.gesture.srcEvent.pageY : e.gesture.srcEvent.touches[0].pageY
                };

                console.log('touchHold', startPos);
            },
            touchMove = function (e) {
                //console.log('touchMove', isDragging);
                if (slideBtnCtrl.dragEnabled) {
                    isDragging   = true;
                    var offset = {
                            left: (ionic.Platform.isIOS()) ? e.pageX - startPos.left : e.touches[0].pageX - startPos.left,
                            top : (ionic.Platform.isIOS()) ? e.pageY - startPos.top  : e.touches[0].pageY - startPos.top
                        },
                        btnWidth = btn.getBoundingClientRect().width,
                        rowWidth = row.getBoundingClientRect().width;

                    if (!done) {

                        if (btnWidth === 0 || rowWidth === 0) {
                            console.log('Width===0!!!???: btnWidth, rowWidth', btnWidth, rowWidth);
                            initDomValues();
                            btnWidth = btn.getBoundingClientRect().width;
                            rowWidth = row.getBoundingClientRect().width;
                        }

                        if (offset.left >= 0 && offset.left <= rowWidth - btnWidth - 1) {
                            posCss = {
                                "transform": "translateX(" + offset.left + "px)",
                                "-webkit-transform": "translateX(" + offset.left + "px)"
                            };
                            offsetX = offset.left;
                            element.css(posCss);

                            if (offset.left + slideTolerance >= rowWidth - btnWidth - 1) {
                                /* Drag to max position */
                                posCss = {
                                    "transform": "translateX(" + (rowWidth - btnWidth - 3) + "px)",
                                    "-webkit-transform": "translateX(" + (rowWidth - btnWidth - 3) + "px)"
                                };
                                element.css(posCss);
                                /* End drag*/

                                offsetX = 0;

                                done = true;
                                isDragging = false;

                                posCss = {
                                    "transform": "translateX(0px)",
                                    "-webkit-transform": "translateX(0px)"
                                };

                                cancelAnimationFrame(animationRequestObj);

                                $timeout(function () {
                                    console.log('onMove done!');
                                    slideBtnCtrl.done = true;

                                    // requires ionic-plugin-keyboard installed (should be if using starter project)
                                    try {
                                        if (cordova.plugins.Keyboard) {
                                            cordova.plugins.Keyboard.close();
                                        }
                                    } catch (ex) {
                                        console.warn('ERROR closing keyboard: ', ex);
                                    }
                                }).then(function () {
                                    slideBtnCtrl.callback(slideBtnCtrl.callbackParamsObj);
                                    // Wait 3 seconds and reset the done status
                                    // This is required when resetting the form
                                    $timeout(function () {
                                        slideBtnCtrl.disabledIf = undefined;
                                        slideBtnCtrl.done = false;
                                        slideBtnCtrl.dragEnabled = false;
                                    }, 3000);
                                });

                            }

                        } else {
                            //console.log('Out of range');
                            offsetX = 0;
                        }
                    }

                } else {
                    //console.log('Not dragging');
                    offsetX = 0;
                }

            },
            touchRelease = function (e) {
                console.log('touchRelease');
                cancelAnimationFrame(animationRequestObj);

                // if manageDrag is setted re-enable side menu opening by dragging
                if (slideBtnCtrl.manageDrag) {
                    $ionicSideMenuDelegate.canDragContent(true);
                }
                isDragging = false;
                startPos = {
                    left: 0,
                    top: 0
                };
                var endPos = {
                        left: e.gesture.center.pageX,
                        top: e.gesture.center.pageY
                    },
                    endPosOffset = {
                        left: endPos.left - startPos.left,
                        top: endPos.top - startPos.top
                    },
                    btnLeft = btn.getBoundingClientRect().left,
                    btnWidth = btn.getBoundingClientRect().width,
                    rowWidth = row.getBoundingClientRect().width;

                if (!done) {
                    posCss = {
                        "transform": "translateX(0px)",
                        "-webkit-transform": "translateX(0px)"
                    };

                    if (offsetX >= rowWidth - btnWidth - 1) {
                        // If not done (shouldn't happen) and released on the container's right border
                        // mark as done and call the callback function
                        $timeout(function () {
                            console.log('onRelease done! (only disables drag)');
                            isDragging = false;
                            //done              = true;
                            //slideBtnCtrl.done = true;

                            // requires ionic-plugin-keyboard installed (should be if using starter project)
                            if (cordova.plugins.Keyboard) {
                                cordova.plugins.Keyboard.close();
                            }
                        }).then(function () {
                            // Callback onRelease done commented, causes some problems when position or
                            // width is not correctly captured
                            //slideBtnCtrl.callback(slideBtnCtrl.callbackParamsObj);
                            $timeout(function () {
                                //slideBtnCtrl.disabledIf = undefined;
                                //slideBtnCtrl.done = false;
                                slideBtnCtrl.dragEnabled = false;
                            }, 3000);
                        });
                    } else {
                        // If released in any other position than the container's right borders
                        // revert dragging to original relative position (0,0)
                        element.css(posCss);
                        $timeout(function () {
                            isDragging = false;
                            slideBtnCtrl.dragEnabled = false;
                        });


                    }
                }

                posCss = {};
            },
            animationTouchMove = function (e) {
                animationRequestObj = requestAnimationFrame(animationTouchMove);
                touchMove(e);
            },

        // Assign all funtions to it's corresponding gesture event
        // Somewhat based on http://blog.scottlogic.com/2014/11/25/ionic-sorter.html
            customHoldGesture,
            dragStartGesture,
            dragGesture,
            dragEndGesture,
            touchStartGesture,
            touchEndGesture,

            holdGesture,     //= $ionicGesture.on('hold', touchHold, element),
            touchMoveGesture,//= $ionicGesture.on('touchmove', touchMove, element),
            mouseMoveGesture,//= $ionicGesture.on('mousemove', touchMove, element),
            releaseGesture;  //= $ionicGesture.on('release', touchRelease, element);

//        // $timeout required for element to get the right value
        $timeout(function () {

            element   = angular.element(document.querySelector('[nav-view="active"] .slide-button button'));

            btn = element[0];
            row = container[0];
            customHoldGesture = ionic.Gesture(btn, {hold_timeout: 100});
            holdGesture       = customHoldGesture.on('hold', touchHold);//$ionicGesture.on('hold', touchHold, element);
            touchMoveGesture  = $ionicGesture.on('touchmove', animationTouchMove, element);
            mouseMoveGesture  = $ionicGesture.on('mousemove', animationTouchMove, element);
            releaseGesture    = $ionicGesture.on('release', touchRelease, element);

            touchStartGesture = $ionicGesture.on('touchstart', touchHold);
            //dragStartGesture  = customHoldGesture.on('dragstart', touchHold);
            //dragGesture       = $ionicGesture.on('drag', animationTouchMove, element);
            //dragEndGesture     = $ionicGesture.on('dragend', touchRelease, element);
            touchEndGesture    = $ionicGesture.on('touchend', touchRelease, element);

        }, 1500);

        // Destroy all custom gesture assignments when the component is destroyed
        $scope.$on('$destroy', function () {
            //$ionicGesture.off(holdGesture, 'hold', touchHold);
            customHoldGesture.off(holdGesture, 'hold', touchHold);
            $ionicGesture.off(touchMoveGesture, 'touchmove', touchMove);
            $ionicGesture.off(mouseMoveGesture, 'mousemove', touchMove);
            $ionicGesture.off(releaseGesture, 'release', touchRelease);

            $ionicGesture.off(holdGesture, 'touchstart', touchHold);
            //customHoldGesture.off(holdGesture, 'dragstart', touchHold);
            //$ionicGesture.off(touchMoveGesture, 'drag', touchMove);
            //$ionicGesture.off(releaseGesture, 'dragend', touchRelease);
            $ionicGesture.off(releaseGesture, 'touchend', touchRelease);
        });


    };

    /**
    * slidebutton component
    * --parameter description here
    **/
    angular.module('app')
        .component('slidebutton', {
            bindings: {
                btnId: '@?',
                btnLabel: '@',
                authText: '@',
                callback: '<',
                callbackParamsObj: '<',
                disabledIf: '=',
                resultObj: '=',
                manageDrag: '='
            },
            controller: slideButtonController,
            templateUrl: 'templates/slideButtonComponent.html'
        });

}(window.angular));
