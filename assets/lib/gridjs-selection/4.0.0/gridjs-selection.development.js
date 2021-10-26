(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('gridjs')) :
    typeof define === 'function' && define.amd ? define(['exports', 'gridjs'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.gridjs = global.gridjs || {}, global.gridjs.selection = {}), global.gridjs));
}(this, (function (exports, gridjs) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var RowSelectionStore = /** @class */ (function (_super) {
        __extends(RowSelectionStore, _super);
        function RowSelectionStore() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RowSelectionStore.prototype.getInitialState = function () {
            return { rowIds: [] };
        };
        RowSelectionStore.prototype.handle = function (type, payload) {
            if (type === 'CHECK') {
                var ROW_ID = payload.ROW_ID;
                this.check(ROW_ID);
            }
            if (type === 'UNCHECK') {
                var ROW_ID = payload.ROW_ID;
                this.uncheck(ROW_ID);
            }
        };
        RowSelectionStore.prototype.check = function (rowId) {
            // rowId already exists
            if (this.state.rowIds.indexOf(rowId) > -1)
                return;
            this.setState({
                rowIds: __spreadArrays([rowId], this.state.rowIds),
            });
        };
        RowSelectionStore.prototype.uncheck = function (rowId) {
            var index = this.state.rowIds.indexOf(rowId);
            // rowId doesn't exist
            if (index === -1)
                return;
            var cloned = __spreadArrays(this.state.rowIds);
            cloned.splice(index, 1);
            this.setState({
                rowIds: cloned,
            });
        };
        return RowSelectionStore;
    }(gridjs.BaseStore));

    var RowSelectionActions = /** @class */ (function (_super) {
        __extends(RowSelectionActions, _super);
        function RowSelectionActions() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RowSelectionActions.prototype.check = function (rowId) {
            this.dispatch('CHECK', {
                ROW_ID: rowId,
            });
        };
        RowSelectionActions.prototype.uncheck = function (rowId) {
            this.dispatch('UNCHECK', {
                ROW_ID: rowId,
            });
        };
        return RowSelectionActions;
    }(gridjs.BaseActions));

    var RowSelection = /** @class */ (function (_super) {
        __extends(RowSelection, _super);
        function RowSelection(props, context) {
            var _this = _super.call(this, props, context) || this;
            _this.isDataCell = function (props) { return props.row !== undefined; };
            _this.getParentTR = function () {
                return _this.base &&
                    _this.base.parentElement &&
                    _this.base.parentElement.parentElement;
            };
            _this.state = {
                isChecked: false,
            };
            // store/dispatcher is required only if we are rendering a TD (not a TH)
            if (_this.isDataCell(props)) {
                // create a new store if a global store doesn't exist
                if (!props.store) {
                    var store = new RowSelectionStore(_this.config.dispatcher);
                    _this.store = store;
                    // to reuse for other checkboxes
                    props.plugin.props.store = store;
                }
                else {
                    // restore the existing store
                    _this.store = props.store;
                }
                _this.actions = new RowSelectionActions(_this.config.dispatcher);
                _this.storeUpdatedFn = _this.storeUpdated.bind(_this);
                _this.store.on('updated', _this.storeUpdatedFn);
                // also mark this checkbox as checked if cell.data is true
                if (props.cell.data) {
                    _this.check();
                }
            }
            return _this;
        }
        RowSelection.prototype.componentWillUnmount = function () {
            this.store.off('updated', this.storeUpdatedFn);
        };
        RowSelection.prototype.componentDidMount = function () {
            if (this.store)
                this.storeUpdated(this.store.state);
        };
        RowSelection.prototype.storeUpdated = function (state) {
            var parent = this.getParentTR();
            if (!parent)
                return;
            var isChecked = state.rowIds.indexOf(this.props.id(this.props.row)) > -1;
            this.setState({
                isChecked: isChecked,
            });
            if (isChecked) {
                parent.classList.add(this.props.selectedClassName);
            }
            else {
                parent.classList.remove(this.props.selectedClassName);
            }
        };
        RowSelection.prototype.check = function () {
            this.actions.check(this.props.id(this.props.row));
            this.props.cell.update(true);
        };
        RowSelection.prototype.uncheck = function () {
            this.actions.uncheck(this.props.id(this.props.row));
            this.props.cell.update(false);
        };
        RowSelection.prototype.toggle = function () {
            if (this.state.isChecked) {
                this.uncheck();
            }
            else {
                this.check();
            }
        };
        RowSelection.prototype.render = function () {
            var _this = this;
            if (this.isDataCell(this.props)) {
                return (gridjs.h("input", { type: 'checkbox', checked: this.state.isChecked, onChange: function () { return _this.toggle(); }, className: this.props.checkboxClassName }));
            }
            return null;
        };
        RowSelection.defaultProps = {
            selectedClassName: gridjs.className('tr', 'selected'),
            checkboxClassName: gridjs.className('checkbox'),
        };
        return RowSelection;
    }(gridjs.PluginBaseComponent));

    exports.RowSelection = RowSelection;
    exports.RowSelectionActions = RowSelectionActions;
    exports.RowSelectionStore = RowSelectionStore;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=gridjs-selection.development.js.map
