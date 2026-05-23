"""Load pickled sklearn models saved with scikit-learn <= 1.3 on newer versions."""

import importlib.util
import os
import pickle
import sys


def register_sklearn_legacy_modules():
    """Register removed internal modules required by older pickled GBM models."""
    if "sklearn.ensemble._gb_losses" in sys.modules:
        return

    legacy_path = os.path.join(os.path.dirname(__file__), "sklearn_compat", "_gb_losses.py")
    if not os.path.exists(legacy_path):
        return

    spec = importlib.util.spec_from_file_location(
        "sklearn.ensemble._gb_losses", legacy_path
    )
    module = importlib.util.module_from_spec(spec)
    module.__package__ = "sklearn.ensemble"
    sys.modules["sklearn.ensemble._gb_losses"] = module
    spec.loader.exec_module(module)


def patch_sklearn_tree_unpickling():
    """Upgrade tree node arrays from sklearn 1.2.x pickles for sklearn 1.5+."""
    import numpy as np
    import sklearn.tree._tree as tree_module

    if getattr(tree_module, "_phishing_demo_patched", False):
        return

    original_check = tree_module._check_node_ndarray

    def patched_check(node_ndarray, expected_dtype):
        field_names = getattr(node_ndarray.dtype, "names", None)
        if (
            field_names
            and "missing_go_to_left" not in field_names
            and expected_dtype.names
            and "missing_go_to_left" in expected_dtype.names
        ):
            upgraded = np.zeros(node_ndarray.shape[0], dtype=expected_dtype)
            for name in field_names:
                upgraded[name] = node_ndarray[name]
            upgraded["missing_go_to_left"] = 0
            node_ndarray = upgraded
        return original_check(node_ndarray, expected_dtype=expected_dtype)

    tree_module._check_node_ndarray = patched_check
    tree_module._phishing_demo_patched = True


def upgrade_loaded_model(model):
    """Set attributes added in newer sklearn versions on pickled estimators."""
    import numpy as np

    trees = []
    if hasattr(model, "estimators_"):
        trees.extend(model.estimators_.ravel())
    if hasattr(model, "init_") and model.init_ is not None:
        init_est = model.init_
        if hasattr(init_est, "estimators_"):
            trees.extend(init_est.estimators_.ravel())
        else:
            trees.append(init_est)

    for est in trees:
        if est is None:
            continue
        if not hasattr(est, "monotonic_cst"):
            est.monotonic_cst = None
        if not hasattr(est, "missing_values_bin_thresh"):
            est.missing_values_bin_thresh = np.nan
        if not hasattr(est, "missing_values_in_feature_mask"):
            est.missing_values_in_feature_mask = None

    if hasattr(model, "_loss") and model._loss is not None:
        loss = model._loss
        if not hasattr(loss, "is_multiclass") and hasattr(loss, "is_multi_class"):
            loss.is_multiclass = loss.is_multi_class

    return model


def legacy_predict(model, X):
    """Run inference using the pickled model's original loss API."""
    import numpy as np
    from sklearn.ensemble._gradient_boosting import predict_stages
    from sklearn.utils.validation import check_array

    X = check_array(X, dtype=np.float32, order="C")
    raw = model._loss.get_init_raw_predictions(X, model.init_)
    predict_stages(model.estimators_, X, model.learning_rate, raw)
    proba = model._loss._raw_prediction_to_proba(raw)
    classes = model.classes_
    predictions = classes[np.argmax(proba, axis=1)]
    return predictions, proba


def load_pickle_model(path: str):
    """Load a pickled sklearn model with backward-compatibility shims applied."""
    register_sklearn_legacy_modules()
    patch_sklearn_tree_unpickling()
    with open(path, "rb") as f:
        model = pickle.load(f)
    return upgrade_loaded_model(model)
